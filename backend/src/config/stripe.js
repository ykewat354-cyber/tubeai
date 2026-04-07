/**
 * Stripe configuration
 * Uses centralized config for API keys
 */

const Stripe = require("stripe");
const config = require("../config");

const stripe = new Stripe(config.stripe.secretKey, { apiVersion: "2024-06-20" });

/**
 * Create Stripe checkout session for subscription
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.userId
 * @param {string} params.priceId
 * @param {string} params.plan
 * @returns {Promise<object>} Checkout session
 */
async function createCheckoutSession({ email, userId, priceId, plan }) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${config.server.frontendUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.server.frontendUrl}/pricing`,
    metadata: { userId, plan },
  });
  return session;
}

/**
 * Create Stripe billing portal session
 * @param {string} customerId
 * @returns {Promise<object>}
 */
async function createBillingPortalSession(customerId) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${config.server.frontendUrl}/dashboard`,
  });
}

module.exports = { stripe, createCheckoutSession, createBillingPortalSession };
