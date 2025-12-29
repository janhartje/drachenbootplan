import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

// Type for Subscription with period fields (sometimes missing/problematic in SDK types)
type SubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start: number;
  current_period_end: number;
};

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Verify user is member of the team
    const membership = await prisma.paddler.findFirst({
      where: {
        userId: session.user.id,
        teamId: teamId,
      },
      include: { team: true }
    });

    if (!membership || !membership.team) {
      return NextResponse.json({ error: 'Not authorized or team not found' }, { status: 403 });
    }

    const team = membership.team;
    
    // No subscription if no customerId
    if (!team.stripeCustomerId) {
      return NextResponse.json({ 
        hasSubscription: false,
        plan: team.plan || 'FREE',
        isBillingUser: team.billingUserId === session.user.id,
        isCustomer: false
      });
    }

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: team.stripeCustomerId,
      status: 'all',
      limit: 10,
      expand: ['data.default_payment_method']
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ 
        hasSubscription: false,
        plan: team.plan || 'FREE',
        isBillingUser: team.billingUserId === session.user.id,
        isCustomer: true
      });
    }

    const sub = subscriptions.data[0] as SubscriptionWithPeriod;
    const priceId = sub.items.data[0]?.price.id;
    const price = sub.items.data[0]?.price;
    
    // Check if subscription is actually active
    const validStatuses = ['active', 'trialing', 'past_due'];
    const isActive = validStatuses.includes(sub.status);

    if (!isActive) {
      return NextResponse.json({ 
        hasSubscription: false,
        plan: team.plan || 'FREE',
        isBillingUser: team.billingUserId === session.user.id,
        isCustomer: true
      });
    }
    
    // Get payment method details
    const paymentMethod = sub.default_payment_method as Stripe.PaymentMethod;

    // Check if current user is the billing user
    const isBillingUser = team.billingUserId === session.user.id;

    return NextResponse.json({
      hasSubscription: true,
      plan: team.plan,
      isBillingUser,
      isCustomer: true,
      subscription: {
        id: sub.id,
        status: sub.status,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        currentPeriodEnd: sub.current_period_end,
        currentPeriodStart: sub.current_period_start,
        interval: price?.recurring?.interval,
        amount: price?.unit_amount,
        currency: price?.currency,
        priceId: priceId,
        paymentMethod: paymentMethod ? {
          brand: paymentMethod.card?.brand,
          last4: paymentMethod.card?.last4,
          expMonth: paymentMethod.card?.exp_month,
          expYear: paymentMethod.card?.exp_year,
        } : null
      },
      history: (subscriptions.data as SubscriptionWithPeriod[])
        .filter(s => !['incomplete', 'incomplete_expired'].includes(s.status))
        .map(s => ({
            id: s.id,
            status: s.status,
            currentPeriodStart: s.current_period_start,
            currentPeriodEnd: s.current_period_end,
            cancelAtPeriodEnd: s.cancel_at_period_end,
            interval: s.items.data[0]?.price.recurring?.interval,
            amount: s.items.data[0]?.price.unit_amount,
            currency: s.items.data[0]?.price.currency,
      }))
    });

  } catch (error) {
    console.error('Subscription Details Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
