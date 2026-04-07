/**
 * Subscription Controller — Billing management
 * Handles: checkout, cancel, resume, update payment method
 */

const { asyncHandler } = require('../middleware/errorHandler');
const { getUserProfile } = require('../services/authService');
const { stripe } = require('../config/stripe');
const { prisma } = require('../server');
const config = require('../config');
const logger = require('../utils/logger');
const { apiResponse } = require('../utils/constants');

/**
 * POST /api/subscription/checkout — Create Stripe checkout session
 */
const createCheckout = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const user = await getUserProfile(req.user.id);
  const priceId = config.stripe.prices[plan];

  if (!priceId) return res.status(400).json(apiResponse(false, 'Invalid plan'));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    metadata: { userId: user.id, plan },
  });

  res.json(apiResponse(true, 'Checkout session created', { url: session.url, sessionId: session.id }));
});

/**
 * POST /api/subscription/cancel — Cancel subscription (at period end)
 * User keeps access until billing period ends
 */
const cancelSubscription = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);

  if (!user.stripeSubId) {
    return res.status(400).json(apiResponse(false, 'No active subscription to cancel'));
  }

  // Cancel at end of current billing period
  await stripe.subscriptions.update(user.stripeSubId, { cancel_at_period_end: true });

  logger.info({ message: 'Subscription cancellation scheduled', userId: user.id });

  res.json(apiResponse(true, 'Subscription will be cancelled at the end of your billing period', {
    plan: user.plan,
    accessUntil: user.subscriptionEnd,
  }));
});

/**
 * POST /api/subscription/resume — Resume a cancelled subscription (before period end)
 */
const resumeSubscription = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { stripeSubId: true },
  });

  if (!user?.stripeSubId) {
    return res.status(400).json(apiResponse(false, 'No subscription to resume'));
  }

  const subscription = await stripe.subscriptions.retrieve(user.stripeSubId);

  if (!subscription.cancel_at_period_end) {
    return res.status(400).json(apiResponse(false, 'Subscription is not scheduled for cancellation'));
  }

  await stripe.subscriptions.update(user.stripeSubId, { cancel_at_period_end: false });

  res.json(apiResponse(true, 'Subscription resumed successfully'));
});

/**
 * GET /api/subscription/portal — Stripe billing portal (manage payments, invoices)
 */
const managePortal = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return res.status(400).json(apiResponse(false, 'No billing history found'));
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL}/dashboard`,
  });

  res.json(apiResponse(true, 'OK', { url: session.url }));
});

/**
 * GET /api/subscription/status — Current subscription info
 */
const getStatus = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);

  let stripeStatus = null;
  if (user.stripeSubId) {
    try {
      const sub = await stripe.subscriptions.retrieve(user.stripeSubId);
      stripeStatus = {
        status: sub.status,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
      };
    } catch (err) {
      logger.error({ message: 'Failed to fetch Stripe subscription', error: err.message });
    }
  }

  res.json(apiResponse(true, 'OK', {
    plan: user.plan,
    subscriptionEnd: user.subscriptionEnd,
    stripe: stripeStatus,
    hasActiveSubscription: user.plan !== 'free' && (!user.subscriptionEnd || new Date(user.subscriptionEnd) > new Date()),
  }));
});

module.exports = { createCheckout, cancelSubscription, resumeSubscription, managePortal, getStatus };
