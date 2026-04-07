const Stripe = require("stripe");

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

/**
 * Create a Stripe checkout session
 */
async function createCheckoutSession({ email, userId, priceId, plan }) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    metadata: {
      userId,
      plan,
    },
  });

  return session;
}

/**
 * Create a Stripe billing portal session
 */
async function createBillingPortalSession(customerId) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.FRONTEND_URL}/dashboard`,
  });

  return session;
}

module.exports = { stripe, createCheckoutSession, createBillingPortalSession };
