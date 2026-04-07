/**
 * Stripe webhook controller
 * Handles payment events and subscription lifecycle
 * Verifies webhook signature to prevent forged requests
 */

const Stripe = require("stripe");
const { asyncHandler } = require("../middleware/errorHandler");
const { prisma } = require("../server");
const config = require("../config");
const logger = require("../utils/logger");

const stripe = new Stripe(config.stripe.secretKey, { apiVersion: "2024-06-20" });

/**
 * Verify Stripe webhook signature
 * @param {object} req - Express request with raw body
 * @returns {object} Stripe event
 * @throws {Error} If signature verification fails
 */
function verifyStripeWebhook(req) {
  const sig = req.headers["stripe-signature"];
  if (!sig) {
    throw new Error("Missing Stripe signature header");
  }

  try {
    return stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
  } catch (err) {
    logger.error({ message: "Webhook signature verification failed", error: err.message });
    throw new Error(`Webhook verification failed: ${err.message}`);
  }
}

/**
 * POST /api/webhook/stripe
 * Handles incoming Stripe webhook events
 */
const handleStripe = asyncHandler(async (req, res) => {
  const event = verifyStripeWebhook(req);

  logger.info({ message: "Stripe webhook received", event: event.type });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;
      const customerId = session.customer;

      if (!userId) {
        logger.error({ message: "Webhook missing userId in metadata", sessionId: session.id });
        break;
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          stripeCustomerId: customerId,
          stripeSubId: session.subscription,
          subscriptionEnd: session.current_period_end
            ? new Date(session.current_period_end * 1000)
            : null,
        },
      });

      logger.info({ message: "Subscription activated", userId });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (subscription.status === "active") {
          await prisma.user.updateMany({
            where: { stripeSubId: subscriptionId },
            data: { subscriptionEnd: new Date(subscription.current_period_end * 1000) },
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await prisma.user.updateMany({
        where: { stripeCustomerId: subscription.customer },
        data: { plan: "free", stripeSubId: null, subscriptionEnd: new Date() },
      });
      logger.info({ message: "Subscription cancelled", customerId: subscription.customer });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      logger.warn({ message: "Payment failed", customerId: invoice.customer });
      break;
    }

    default:
      logger.info({ message: "Unhandled webhook event", event: event.type });
  }

  // Always respond 200 to Stripe (prevents retry loop)
  res.json({ received: true });
});

module.exports = { handleStripe };
