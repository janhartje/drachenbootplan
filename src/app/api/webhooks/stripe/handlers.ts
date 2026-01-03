import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/email';
import PaymentFailedEmail from '@/emails/templates/PaymentFailedEmail';
import TrialEndingEmail from '@/emails/templates/TrialEndingEmail';

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (!session.metadata?.teamId) {
    console.error('Webhook: Missing teamId in metadata');
    return;
  }

  await prisma.team.update({
    where: { id: session.metadata.teamId },
    data: {
      stripeCustomerId: session.customer as string,
      plan: 'PRO',
      subscriptionStatus: 'active',
      maxMembers: 100,
    },
  });
  console.log(`PRO-FULFILLMENT: Team ${session.metadata.teamId} upgraded via checkout.session.completed`);
}

export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

  if (!customerId) {
    console.error('Webhook invoice.payment_succeeded: No customer ID');
    return;
  }

  // Prefer metadata from subscription if available
  let teamId = invoice.parent?.subscription_details?.metadata?.teamId;
  if (!teamId && invoice.metadata?.teamId) {
    teamId = invoice.metadata.teamId;
  }

  const where = teamId ? { id: teamId } : { stripeCustomerId: customerId };
  const customerTeam = await prisma.team.findFirst({ where });

  if (customerTeam) {
    await prisma.team.update({
      where: { id: customerTeam.id },
      data: {
        plan: 'PRO',
        subscriptionStatus: 'active',
        maxMembers: 100,
      }
    });
    console.log(`PRO-FULFILLMENT: Team ${customerTeam.id} upgraded/maintained via invoice.payment_succeeded`);
  } else {
    console.error('Webhook: No team found for customer:', customerId);
  }
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  console.error(`PRO-PAYMENT-FAILED: Payment failed for Customer ${customerId} (Invoice: ${invoice.id})`);

  if (customerId) {
    const team = await prisma.team.findFirst({ where: { stripeCustomerId: customerId } });
    if (team) {
      console.log(`ACTION-REQUIRED: Notify Team ${team.id} about failed payment`);

      // Find recipient email (Billing User or Team Email)
      let recipientEmail = team.email;
      if (team.billingUserId) {
        const billingUser = await prisma.user.findUnique({ where: { id: team.billingUserId } });
        if (billingUser?.email) recipientEmail = billingUser.email;
      }

      if (recipientEmail) {
        await sendEmail({
          to: recipientEmail,
          subject: 'Zahlung fehlgeschlagen - Drachenboot Manager',
          template: 'PaymentFailedEmail',
          react: PaymentFailedEmail({
            teamName: team.name,
            teamId: team.id
          })
        });
        console.log(`EMAIL-SENT: Payment failed notification sent to ${recipientEmail}`);
      } else {
        console.warn(`EMAIL-SKIPPED: No email found for Team ${team.id}`);
      }
    }
  }
}

export async function handleSubscriptionUpdated(sub: Stripe.Subscription, eventType: string) {
  const teamId = sub.metadata?.teamId;
  const customerId = sub.customer as string;

  // Try to find team by ID first (more reliable), then by customer ID
  const customerTeam = teamId
    ? await prisma.team.findUnique({ where: { id: teamId } })
    : await prisma.team.findFirst({ where: { stripeCustomerId: customerId } });

  if (!customerTeam) {
    console.error(`Webhook ${eventType}: No team found for customer ${customerId} or teamId ${teamId}`);
    return;
  }

  if (sub.status === 'active' || sub.status === 'trialing') {
    await prisma.team.update({
      where: { id: customerTeam.id },
      data: {
        plan: 'PRO',
        subscriptionStatus: sub.status,
        maxMembers: 100,
        stripeCustomerId: customerId,
      }
    });
    console.log(`PRO-UPDATE: Team ${customerTeam.id} status updated to ${sub.status}`);

  } else if (sub.status === 'canceled' || sub.status === 'unpaid' || sub.status === 'incomplete_expired') {
    await prisma.team.update({
      where: { id: customerTeam.id },
      data: {
        subscriptionStatus: sub.status,
        plan: 'FREE',
        maxMembers: 25,
      }
    });
    console.log(`PRO-DOWNGRADE: Team ${customerTeam.id} downgraded to FREE due to status: ${sub.status}`);

  } else {
    // past_due, incomplete -> just update status
    await prisma.team.update({
      where: { id: customerTeam.id },
      data: { subscriptionStatus: sub.status }
    });
    console.log(`PRO-STATUS-CHANGE: Team ${customerTeam.id} status changed to ${sub.status}`);
  }
}

export async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;

  const canceledTeams = await prisma.team.findMany({
    where: { stripeCustomerId: customerId }
  });

  for (const team of canceledTeams) {
    await prisma.team.update({
      where: { id: team.id },
      data: {
        plan: 'FREE',
        subscriptionStatus: 'canceled',
        maxMembers: 25,
      }
    });
    console.log(`PRO-DOWNGRADE: Team ${team.id} downgraded due to subscription deletion`);
  }
}

export async function handleTrialWillEnd(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;
  console.log(`PRO-TRIAL-ENDING: Trial ending soon for Customer ${customerId}`);

  const team = await prisma.team.findFirst({ where: { stripeCustomerId: customerId } });
  if (team) {
    let recipientEmail = team.email;
    if (team.billingUserId) {
      const billingUser = await prisma.user.findUnique({ where: { id: team.billingUserId } });
      if (billingUser?.email) recipientEmail = billingUser.email;
    }

    if (recipientEmail) {
      await sendEmail({
        to: recipientEmail,
        subject: 'Deine Testphase endet bald',
        template: 'TrialEndingEmail',
        react: TrialEndingEmail({
          teamName: team.name,
          teamId: team.id
        })
      });
      console.log(`EMAIL-SENT: Trial ending notification sent to ${recipientEmail}`);
    }
  }
}

export async function handleCustomerUpdated(customer: Stripe.Customer) {
  const customerId = customer.id;
  const team = await prisma.team.findFirst({ where: { stripeCustomerId: customerId } });

  if (team) {
    console.log(`CUSTOMER-SYNC: Synced info for Team ${team.id} from Stripe`);
  }
}
