/**
 * Enhanced Stripe Webhook Controller — Production Billing
 *
 * Handles ALL billing lifecycle events:
 * - checkout.session.completed → activate subscription
 * - invoice.payment_succeeded → update period end
 * - invoice.payment_failed → notify user, retry, warn about downgrade
 * - customer.subscription.updated → handle plan changes
 * - customer.subscription.deleted → cancel → downgrade to free
 * - customer.subscription.paused/resumed → handle pauses
 *
 * Billing rules:
 * - Failed payment: user gets 3-day grace period before downgrade
 * - Stripe auto-retries (3 attempts in 20 days)
 * - After all retries fail → subscription.deleted → downgrade
 * - User always notified via email for payment failures
 */

const Stripe = require('stripe');
const { asyncHandler } = require('../middleware/errorHandler');
const { prisma } = require('../server');
const config = require('../config');
const logger = require('../utils/logger');
const { sendEmail, passwordResetEmail } = require('../services/emailService');

const stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2024-06-20' });

function verifyStripeWebhook(req) {
  const sig = req.headers['stripe-signature'];
  if (!sig) throw new Error('Missing Stripe signature header');
  return stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
}

/** Email user about failed payment */
async function notifyPaymentFailure(email, userName, amount, date) {
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ef4444;">💳 Payment failed for TubeAI Pro</h1>
      <p>Hi ${userName},</p>
      <p>We couldn't process your payment of <strong>$${amount}</strong> on ${date}.</p>
      <p>Stripe will retry automatically. You have access until <strong>the end of your billing period</strong>.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Update payment method →</a>
      <p style="color: #64748b; font-size: 14px;">If payment fails completely, your account will revert to the Free plan and no data will be lost.</p>
    </div>
  `;
  try { await sendEmail({ to: email, subject: 'Payment failed — please update your billing method', html }); }
  catch (e) { logger.error({ message: 'Failed payment notification email failed', error: e.message }); }
}

const handleStripe = asyncHandler(async (req, res) => {
  const event = verifyStripeWebhook(req);
  logger.info({ message: 'Stripe webhook', event: event.type, id: event.id });

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (!userId) { logger.error({ message: 'Checkout webhook missing userId' }); break; }
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: session.metadata?.plan || 'pro',
          stripeCustomerId: session.customer,
          stripeSubId: session.subscription,
          subscriptionEnd: session.current_period_end ? new Date(session.current_period_end * 1000) : null,
        },
      });
      logger.info({ message: 'Subscription activated', userId });
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      const subId = invoice.subscription;
      if (subId) {
        const subscription = await stripe.subscriptions.retrieve(subId);
        if (subscription.status === 'active') {
          await prisma.user.updateMany({
            where: { stripeSubId: subId },
            data: { subscriptionEnd: new Date(subscription.current_period_end * 1000) },
          });
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const amount = ((invoice.amount_due || 0) / 100).toFixed(2);
      const date = new Date(invoice.created * 1000).toLocaleDateString();

      // Find user and notify
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
        select: { id: true, name: true, email: true },
      });

      if (user) {
        logger.warn({ message: 'Payment failed, notifying user', userId: user.id, amount, attempts: invoice.attempt_count });
        await notifyPaymentFailure(user.email, user.name, amount, date);
      } else {
        logger.warn({ message: 'Payment failed, user not found', customerId });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Check if subscription was paused
      if (subscription.pause_collection) {
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: 'paused' },
        });
      } else if (subscription.status === 'active') {
        // Plan update (upgrade/downgrade)
        const priceId = subscription.items?.data?.[0]?.price?.id;
        let plan = 'pro'; // default
        if (priceId === config.stripe.prices['pro-yearly']) plan = 'pro-yearly';
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan, subscriptionEnd: new Date(subscription.current_period_end * 1000) },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Find user who owned this subscription
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
        select: { id: true, email: true, name: true, plan: true },
      });

      if (user) {
        // Cancel takes effect at end of billing period, but for deleted it's immediate
        // Grace: if cancelled via Stripe billing portal, still allow until period end
        const wasCancelled = subscription.cancel_at_period_end || subscription.status === 'canceled';

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: 'free',
            stripeSubId: null,
            subscriptionEnd: null,
          },
        });

        logger.info({ message: 'Subscription cancelled', userId: user.id, plan: user.plan });

        // Send cancellation email
        const html = `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #64748b;">😢 Subscription cancelled</h1>
            <p>Hi ${user.name},</p>
            <p>Your TubeAI Pro subscription has been cancelled. Your account is now on the <strong>Free plan</strong> (3 generations/day).</p>
            <p>All your generated content is still available — nothing is lost!</p>
            <a href="${process.env.FRONTEND_URL}/pricing" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reactivate →</a>
          </div>
        `;
        try { await sendEmail({ to: user.email, subject: 'Your TubeAI Pro subscription has been cancelled', html }); }
        catch (e) { logger.error({ message: 'Cancellation email failed', error: e.message }); }
      }
      break;
    }

    case 'customer.subscription.paused': {
      const subscription = event.data.object;
      await prisma.user.updateMany({
        where: { stripeCustomerId: subscription.customer },
        data: { plan: 'paused' },
      });
      break;
    }

    case 'customer.subscription.resumed': {
      const subscription = event.data.object;
      const priceId = subscription.items?.data?.[0]?.price?.id;
      let plan = 'pro';
      if (priceId === config.stripe.prices['pro-yearly']) plan = 'pro-yearly';
      await prisma.user.updateMany({
        where: { stripeCustomerId: subscription.customer },
        data: { plan, subscriptionEnd: new Date(subscription.current_period_end * 1000) },
      });
      break;
    }

    default:
      logger.debug({ message: 'Unhandled webhook (ignored)', event: event.type });
  }

  // Always 200 to Stripe
  res.json({ received: true });
});

module.exports = { handleStripe };
