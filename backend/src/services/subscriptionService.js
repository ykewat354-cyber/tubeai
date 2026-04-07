/**
 * Subscription service
 * Manages Stripe checkout, billing portal, and subscription lifecycle.
 *
 * Flow:
 * 1. User selects plan → createCheckout() → redirects to Stripe
 * 2. Stripe processes payment → webhook activates subscription
 * 3. User manages subscription → Stripe billing portal
 * 4. Cancellation → webhook downgrades to free plan
 *
 * @module subscriptionService
 */

const { prisma } = require("../server");
const { createCheckoutSession, createBillingPortalSession, stripe } = require("../config/stripe");

/**
 * Create a Stripe checkout session for subscription upgrade
 *
 * @param {string} userId - User UUID (stored in metadata for webhook)
 * @param {string} email - User email (pre-fills Stripe form)
 * @param {string} plan - Plan key: "pro" or "pro-yearly"
 * @returns {Promise<{url: string, sessionId: string}>} Checkout URL and session ID
 * @throws {Error} If plan is invalid or price ID missing
 */
async function createCheckout(userId, email, plan) {
  // Map plan key to Stripe Price ID
  const priceMap = {
    pro: process.env.STRIPE_PRICE_ID_PRO,
    "pro-yearly": process.env.STRIPE_PRICE_ID_PRO_YEARLY,
  };

  const priceId = priceMap[plan];
  if (!priceId) {
    throw new Error("Invalid plan selected");
  }

  const session = await createCheckoutSession({
    email,
    userId,
    priceId,
    plan,
  });

  return { url: session.url, sessionId: session.id };
}

/**
 * Create a Stripe billing portal session for managing subscription
 * (cancel, update payment method, view invoices)
 *
 * @param {string} userId - User UUID
 * @returns {Promise<{url: string}>} Billing portal URL
 * @throws {Error} If user has no active Stripe customer ID
 */
async function createManagePortal(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user || !user.stripeCustomerId) {
    throw new Error("No active subscription found");
  }

  const session = await createBillingPortalSession(user.stripeCustomerId);

  return { url: session.url };
}

/**
 * Activate user's subscription after successful Stripe payment
 * Called from both webhook and session check endpoint
 *
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise<void>}
 * @throws {Error} If payment not completed
 */
async function activateSubscription(sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "customer"],
  });

  if (session.payment_status !== "paid") {
    throw new Error("Payment not completed");
  }

  const userId = session.metadata.userId;
  const plan = session.metadata.plan;
  const customerId = session.customer?.id;

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
}

/**
 * Cancel subscription — downgrade user to free plan
 * Called by webhook on customer.subscription.deleted event
 *
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<void>}
 */
async function cancelSubscription(customerId) {
  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      plan: "free",
      stripeSubId: null,
      subscriptionEnd: new Date(),
    },
  });
}

module.exports = {
  createCheckout,
  createManagePortal,
  activateSubscription,
  cancelSubscription,
};
