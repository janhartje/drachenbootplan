import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const BATCH_SIZE = 10;
const MAX_RETRIES = 3;

export interface ProcessQueueResult {
  processed: number;
  results: Array<{ id: string; status: string; error?: string }>;
}

/**
 * Process pending emails from the queue.
 * This can be called from:
 * - The cron endpoint (/api/cron/mail-queue)
 * - Directly after queueing an email (fire-and-forget)
 */
export async function processMailQueue(): Promise<ProcessQueueResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }
  const resend = new Resend(resendApiKey);

  // 1. Fetch pending emails
  const pendingEmails = await prisma.emailQueue.findMany({
    where: {
      status: { in: ['pending'] },
    },
    take: BATCH_SIZE,
    orderBy: { createdAt: 'asc' },
  });

  if (pendingEmails.length === 0) {
    return { processed: 0, results: [] };
  }

  const results: ProcessQueueResult['results'] = [];

  // 2. Process each email
  for (const email of pendingEmails) {
    try {
      // Mark as processing
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { status: 'processing' },
      });

      // Send via Resend
      const { error } = await resend.emails.send({
        from: email.from || 'Drachenboot Manager <no-reply@drachenbootmanager.de>',
        to: email.to,
        replyTo: email.replyTo || undefined,
        subject: email.subject,
        html: email.body,
      });

      if (error) {
        throw new Error(JSON.stringify(error));
      }

      // Success
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { 
          status: 'sent', 
          attempts: { increment: 1 },
        },
      });
      
      results.push({ id: email.id, status: 'sent' });

    } catch (err) {
      console.error(`Failed to send email ${email.id}:`, err);
      const isRetryable = (email.attempts + 1) < MAX_RETRIES;
      const newStatus = isRetryable ? 'pending' : 'failed';
      
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { 
          status: newStatus, 
          attempts: { increment: 1 },
          lastError: err instanceof Error ? err.message : String(err)
        },
      });
      results.push({ 
        id: email.id, 
        status: newStatus, 
        error: err instanceof Error ? err.message : String(err) 
      });
    }
  }

  return { processed: results.length, results };
}
