/**
 * Subscription service
 * Handles Stripe checkout, billing portal, and subscription lifecycle
 */

const { prisma } = require("../server");
const { createCheckoutSession, createBillingPortalSession, stripe } = require("../config/stripe");
const config = require("../config");

/**
 * Create a Stripe checkout session
 * @param {string} userId
 * @param {string} email
 * @param {string} plan
 * @returns {Promise<{url: string}>}
 */
async function createCheckout(userId, email, plan) {
  const priceId = config.stripe.prices[plan];
  if (!priceId) throw new Error("Invalid plan selected");

  const session = await createCheckoutSession({ email, userId, priceId, plan });
  return { url: session.url };
}

/**
 * Create billing portal session for subscription management
 * @param {string} userId
 * @returns {Promise<{url: string}>}
 */
async function createManagePortal(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) throw new Error("No active subscription found");

  const session = await createBillingPortalSession(user.stripeCustomerId);
  return { url: session.url };
}

module.exports = { createCheckout, createManagePortal };
