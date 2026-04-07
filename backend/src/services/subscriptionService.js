const { prisma } = require("../server");
const { createCheckoutSession, createBillingPortalSession, stripe } = require("../config/stripe");

/**
 * Create a checkout session for subscription
 */
async function createCheckout(userId, email, plan) {
  // Determine price ID
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
 * Create billing portal session for managing subscription
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
 * Handle successful subscription payment
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
      subscriptionEnd: new Date(session.current_period_end * 1000),
    },
  });
}

/**
 * Handle subscription cancellation via webhook
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
