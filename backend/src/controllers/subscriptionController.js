/**
 * Subscription controller
 * Handles Stripe checkout, billing portal, and session checks
 */

const { asyncHandler } = require("../middleware/errorHandler");
const { createCheckout, createManagePortal, activateSubscription } = require("../services/subscriptionService");
const { getUserProfile } = require("../services/authService");
const { stripe } = require("../config/stripe");
const { apiResponse } = require("../utils/constants");

/**
 * POST /api/subscription/checkout
 * Creates a Stripe checkout session
 */
const createCheckout = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const user = await getUserProfile(req.user.id);
  const { url } = await createCheckout(req.user.id, user.email, plan);

  res.json(apiResponse(true, "Checkout session created", { url }));
});

/**
 * GET /api/subscription/portal
 * Opens Stripe billing portal for subscription management
 */
const manageSubscription = asyncHandler(async (req, res) => {
  const { url } = await createManagePortal(req.user.id);

  res.json(apiResponse(true, "OK", { url }));
});

/**
 * POST /api/subscription/check-session?session_id=xxx
 * Verifies checkout session and activates subscription
 */
const checkSession = asyncHandler(async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json(apiResponse(false, "session_id is required"));
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status === "paid") {
    await activateSubscription(session_id);
    return res.json(apiResponse(true, "Subscription activated"));
  }

  res.json(apiResponse(true, `Session status: ${session.status}`, { status: session.status }));
});

module.exports = { createCheckout, manageSubscription, checkSession };
