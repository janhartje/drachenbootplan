/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  handleCheckoutSessionCompleted, 
  handleInvoicePaymentSucceeded, 
  handleInvoicePaymentFailed,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleTrialWillEnd,
  handleInvoicePaymentActionRequired
} from '../handlers';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { PLAN_LIMITS } from '@/lib/utils';

// Mock Modules
jest.mock('@/lib/prisma', () => ({
  team: {
    update: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
}));

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('@/emails/utils/i18n', () => ({
  t: (lang: string, key: string) => key,
}));

// Mock Email Templates functions to avoid rendering issues
jest.mock('@/emails/templates/PaymentFailedEmail', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/emails/templates/TrialEndingEmail', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/emails/templates/PaymentActionRequiredEmail', () => ({
  __esModule: true,
  default: () => null,
}));


describe('Stripe Webhook Handlers', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('handleCheckoutSessionCompleted', () => {
    it('should update team to PRO plan', async () => {
      const session = {
        metadata: { teamId: 'team-123' },
        customer: 'cus_123',
      };

      await handleCheckoutSessionCompleted(session as any);

      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { id: 'team-123' },
        data: {
          stripeCustomerId: 'cus_123',
          plan: 'PRO',
          subscriptionStatus: 'active',
          maxMembers: PLAN_LIMITS.PRO,
        },
      });
    });

    it('should log error if teamId is missing', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const session = { metadata: {} };

      await handleCheckoutSessionCompleted(session as any);

      expect(prisma.team.update).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Missing teamId'));
      
      consoleSpy.mockRestore();
    });
  });

  describe('handleInvoicePaymentSucceeded', () => {
    it('should renew subscription for existing team', async () => {
      const invoice = {
        customer: 'cus_123',
        subscription_details: { metadata: { teamId: 'team-123' } },
      };

      (prisma.team.findFirst as jest.Mock).mockResolvedValue({ id: 'team-123' });

      await handleInvoicePaymentSucceeded(invoice as any);

      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { id: 'team-123' },
        data: expect.objectContaining({
          plan: 'PRO',
          subscriptionStatus: 'active',
        }),
      });
    });

    it('should handle team lookup by customer ID if metadata missing', async () => {
      const invoice = { customer: 'cus_123' };
      (prisma.team.findFirst as jest.Mock).mockResolvedValue({ id: 'team-found-by-cus' });

      await handleInvoicePaymentSucceeded(invoice as any);

      expect(prisma.team.findFirst).toHaveBeenCalledWith({ where: { stripeCustomerId: 'cus_123' }});
      expect(prisma.team.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleInvoicePaymentFailed', () => {
    it('should send failure email if team and email found', async () => {
      const invoice = { id: 'inv_123', customer: 'cus_123' };
      
      const mockTeam = { 
        id: 'team-1', 
        stripeCustomerId: 'cus_123', 
        email: 'team@example.com',
        billingUserId: null 
      };
      
      (prisma.team.findFirst as jest.Mock).mockResolvedValue(mockTeam);

      await handleInvoicePaymentFailed(invoice as any);

      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'team@example.com',
        template: 'PaymentFailedEmail',
      }));
    });

    it('should gracefully handle missing customer/team', async () => {
       (prisma.team.findFirst as jest.Mock).mockResolvedValue(null);
       await handleInvoicePaymentFailed({ customer: 'cus_unknown' } as any);
       expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('handleSubscriptionUpdated', () => {
     it('should update status to active', async () => {
       const sub = { 
         status: 'active', 
         customer: 'cus_123', 
         metadata: { teamId: 'team-1' } 
       };
       
       (prisma.team.findUnique as jest.Mock).mockResolvedValue({ id: 'team-1' });

       await handleSubscriptionUpdated(sub as any, 'updated');

       expect(prisma.team.update).toHaveBeenCalledWith({
         where: { id: 'team-1' },
         data: expect.objectContaining({
           subscriptionStatus: 'active',
           plan: 'PRO',
         }),
       });
     });

     it('should downgrade to FREE on cancel/unpaid', async () => {
        const sub = { 
         status: 'canceled', 
         customer: 'cus_123',
         metadata: { teamId: 'team-1' } 
       };
       (prisma.team.findUnique as jest.Mock).mockResolvedValue({ id: 'team-1' });

       await handleSubscriptionUpdated(sub as any, 'updated');

       expect(prisma.team.update).toHaveBeenCalledWith({
         where: { id: 'team-1' },
         data: expect.objectContaining({
           plan: 'FREE',
           maxMembers: PLAN_LIMITS.FREE,
         }),
       });
     });
  });
  
  describe('handleSubscriptionDeleted', () => {
      it('should cancel subscription for all matching teams', async () => {
          const sub = { customer: 'cus_123' };
          
          await handleSubscriptionDeleted(sub as any);
          
          expect(prisma.team.updateMany).toHaveBeenCalledWith({
              where: { stripeCustomerId: 'cus_123' },
              data: expect.objectContaining({
                  plan: 'FREE',
                  subscriptionStatus: 'canceled',
              })
          });
      });
  });

  describe('handleTrialWillEnd', () => {
      it('should send warning email', async () => {
          (prisma.team.findFirst as jest.Mock).mockResolvedValue({ 
              id: 'team-1', 
              email: 'test@example.com' 
          });
          
          await handleTrialWillEnd({ customer: 'cus_123' } as any);
          
          expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
             template: 'TrialEndingEmail' 
          }));
      });
  });
  
  describe('handleInvoicePaymentActionRequired', () => {
      it('should send action required email', async () => {
          (prisma.team.findFirst as jest.Mock).mockResolvedValue({ 
              id: 'team-1', 
              email: 'test@example.com' 
          });
          
          await handleInvoicePaymentActionRequired({ customer: 'cus_123' } as any);
          
          expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
             template: 'PaymentActionRequiredEmail' 
          }));
      });
  });

});
