import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

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

    // Verify user is member of the team and has permission (billing user or admin/captain)
    // For now, we enforce that the user must be the billing user or a captain to see invoices.
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
    
    // Check if user is billing user or captain
    const isBillingUser = team.billingUserId === session.user.id;
    const isCaptain = membership.role === 'CAPTAIN';

    if (!isBillingUser && !isCaptain) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!team.stripeCustomerId) {
      return NextResponse.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: team.stripeCustomerId,
      limit: 12, // Show last year roughly
    });

    const formattedInvoices = invoices.data
      .filter(invoice => {
        // Exclude drafts and voided invoices
        if (['draft', 'void', 'uncollectible'].includes(invoice.status || '')) return false;

        // Exclude initial subscription invoices that are not paid yet (abandoned checkouts)
        // If it's 'open' and reason is 'subscription_create', it's likely the checkout page artifact.
        if (invoice.status === 'open' && invoice.billing_reason === 'subscription_create') {
            return false;
        }

        return true;
      })
      .map(invoice => ({
        id: invoice.id,
        date: invoice.created,
        amount: invoice.total,
        currency: invoice.currency,
        status: invoice.status,
        invoicePdf: invoice.invoice_pdf,
        number: invoice.number
      }));

    return NextResponse.json({ invoices: formattedInvoices });

  } catch (error) {
    console.error('Invoices Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
