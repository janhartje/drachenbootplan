import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

// Type for Invoice with expanded payment_intent field
type InvoiceWithPaymentIntent = Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent | string | null };

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId, interval = 'year' } = await request.json();

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Verify user is owner/captain of the team
    const membership = await prisma.paddler.findFirst({
      where: {
        userId: session.user.id,
        teamId: teamId,
        role: 'CAPTAIN', // Only captains can purchase subscriptions
      },
      include: { team: true }
    });

    if (!membership || !membership.team) {
      return NextResponse.json({ error: 'Not authorized or team not found' }, { status: 403 });
    }
    
    if (!process.env.STRIPE_PRO_PRICE_ID) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    // DYNAMIC PRICE LOOKUP
    // 1. Get the configured price to find the product
    const basePrice = await stripe.prices.retrieve(process.env.STRIPE_PRO_PRICE_ID);
    const productId = typeof basePrice.product === 'string' ? basePrice.product : basePrice.product.id;
    
    // 2. List active recurring prices for this product
    const prices = await stripe.prices.list({
        product: productId,
        active: true,
        type: 'recurring',
        limit: 10,
    });
    
    // 3. Find the price matching the requested interval
    const selectedPrice = prices.data.find(p => p.recurring?.interval === interval);
    
    if (!selectedPrice) {
        console.error(`No price found for interval: ${interval} on product: ${productId}`);
        return NextResponse.json({ error: `Price for ${interval} interval not found` }, { status: 404 });
    }
    
    const targetPriceId = selectedPrice.id;
    console.log(`Selected Price ID for ${interval}:`, targetPriceId);

    const team = membership.team;
    let customerId = team.stripeCustomerId;

    if (customerId) {
        // Verify customer exists in Stripe
        try {
            const customer = await stripe.customers.retrieve(customerId);
            if ((customer as Stripe.DeletedCustomer).deleted) {
                customerId = null;
            }
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (error.code === 'resource_missing') {
                console.log('Stripe customer missing, creating new one');
                customerId = null;
            } else {
                throw error;
            }
        }
    }

    if (!customerId) {
        const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        name: team.name,
        metadata: {
            teamId: team.id,
        },
        });
        customerId = customer.id;
        
        // Update team with new customer ID and set billing user
        await prisma.team.update({
            where: { id: team.id },
            data: { 
            stripeCustomerId: customerId,
            billingUserId: session.user.id, // The user purchasing becomes the billing admin
            }
        });
    }

    console.log('Creating subscription for team:', teamId, 'with price:', targetPriceId);
    
    // Check for existing incomplete subscription
    console.log('Checking for existing subscriptions for customer:', customerId);
    const existingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'incomplete', 
        limit: 3,
        expand: ['data.latest_invoice.payment_intent'],
    });

    // Helper to ensure we have an expanded invoice
    const getExpandedInvoice = async (invId: string): Promise<InvoiceWithPaymentIntent | null> => {
        try {
            let inv = await stripe.invoices.retrieve(invId, { expand: ['payment_intent'] }) as InvoiceWithPaymentIntent;
            console.log(`Invoice ${invId} status: ${inv.status}, has PI: ${!!inv.payment_intent}`);
            
            if (inv.status === 'draft') {
                console.log(`Invoice ${invId} is in draft, finalizing...`);
                inv = await stripe.invoices.finalizeInvoice(invId, { expand: ['payment_intent'] }) as InvoiceWithPaymentIntent;
                console.log(`Finalized invoice ${invId}, status: ${inv.status}, has PI: ${!!inv.payment_intent}`);
            }
            return inv;
        } catch (e) {
            console.error('Failed to expand/finalize invoice:', invId, e);
            return null;
        }
    };

    let subscription: Stripe.Subscription | undefined;
    let paymentIntent: Stripe.PaymentIntent | null = null;

    for (const sub of existingSubscriptions.data) {
        // Ensure latest_invoice is an object and has payment_intent
        let inv: InvoiceWithPaymentIntent | null = null;
        if (typeof sub.latest_invoice === 'string') {
            inv = await getExpandedInvoice(sub.latest_invoice);
        } else if (sub.latest_invoice) {
            inv = sub.latest_invoice as InvoiceWithPaymentIntent;
            // If it's an object but PI is just an ID string, we must expand it
            if (typeof inv.payment_intent === 'string') {
                inv = await getExpandedInvoice(inv.id);
            }
        }

        const pi = (inv && typeof inv.payment_intent === 'object' ? inv.payment_intent : null) as Stripe.PaymentIntent | null;
        const subPriceId = sub.items.data[0]?.price.id;
        
        if (subPriceId !== targetPriceId) {
            console.log('Found incomplete subscription but with wrong price, cancelling:', sub.id);
            try { await stripe.subscriptions.cancel(sub.id); } catch { /* ignore */ }
            continue;
        }
        
        if (inv && pi && pi.client_secret) {
            console.log('Found valid reusable subscription:', sub.id, 'with PI:', pi.id);
            subscription = sub;
            subscription.latest_invoice = inv; // Attach the expanded one
            paymentIntent = pi;
            break;
        } else {
            console.log('Found broken/stuck subscription (missing PI or secret), cancelling:', sub.id);
            try {
                await stripe.subscriptions.cancel(sub.id);
            } catch (e) {
                console.error('Failed to cancel broken sub:', e);
            }
        }
    }

    if (subscription) {
        console.log('Reusing existing incomplete subscription:', subscription.id);
    } else {
        console.log('No reusable valid subscription found. Creating new one.');
        // Create Subscription
        // Restore explicit payment settings as defaults failed
        subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: targetPriceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { 
                save_default_payment_method: 'on_subscription',
                payment_method_types: ['card'], // Explicitly set to force PI creation robustness
            },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                teamId: team.id,
            },
        });
        console.log('Subscription created:', subscription.id, 'Status:', subscription.status);
    }

    let latestInvoice: InvoiceWithPaymentIntent | null = subscription.latest_invoice as InvoiceWithPaymentIntent;
    
    // Fetch price details to return to frontend
    const priceDetails = await stripe.prices.retrieve(targetPriceId);

    if (subscription && !paymentIntent) {
        console.log('Missing Payment Intent. Analyzing subscription latest_invoice...');
        const currentInvRef = subscription.latest_invoice;
        
        if (typeof currentInvRef === 'string') {
            latestInvoice = await getExpandedInvoice(currentInvRef);
        } else if (currentInvRef) {
            latestInvoice = currentInvRef as InvoiceWithPaymentIntent;
            // Expansion check
            if (!latestInvoice.payment_intent || typeof latestInvoice.payment_intent === 'string' || latestInvoice.status === 'draft') {
                latestInvoice = await getExpandedInvoice(latestInvoice.id);
            }
        }

        if (latestInvoice && typeof latestInvoice.payment_intent === 'object') {
            paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;
        }
        
        // Final attempt if still missing: retrieve subscription afresh with full expansion
        if (!paymentIntent) {
            console.log('Still missing PI. Retrying full subscription expansion as final fallback...');
            const finalSub = await stripe.subscriptions.retrieve(subscription.id, {
                expand: ['latest_invoice.payment_intent']
            });
            latestInvoice = finalSub.latest_invoice as InvoiceWithPaymentIntent;
            if (latestInvoice && typeof latestInvoice.payment_intent === 'object') {
                paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;
            } else if (latestInvoice && typeof latestInvoice.payment_intent === 'string') {
                // Should not happen with expand, but Stripe...
                paymentIntent = await stripe.paymentIntents.retrieve(latestInvoice.payment_intent);
            }
        }
    }

    if (paymentIntent) {
        console.log('Final Payment Intent:', paymentIntent.id, 'Status:', paymentIntent.status);
    }

    if (!latestInvoice || !paymentIntent || !paymentIntent.client_secret) {
        // Create a new fresh subscription if the old one is borked
        // Or just return error
         console.error('Missing invoicing details:', { 
            hasInvoice: !!latestInvoice, 
            hasIntent: !!paymentIntent, 
            hasSecret: !!paymentIntent?.client_secret 
         });
         return NextResponse.json({ error: 'Failed to create payment intent. Please contact support.' }, { status: 500 });
    }

    return NextResponse.json({ 
        subscriptionId: subscription.id, 
        clientSecret: paymentIntent.client_secret,
        price: {
            amount: priceDetails.unit_amount,
            currency: priceDetails.currency,
            interval: priceDetails.recurring?.interval,
        }
    });

  } catch (error) {
    console.error('Stripe Subscription Creation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
