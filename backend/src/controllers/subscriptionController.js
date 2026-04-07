const { asyncHandler } = require("../middleware/errorHandler");
const { createCheckout, createManagePortal, activateSubscription } = require("../services/subscriptionService");
const { getUserProfile } = require("../services/authService");
const { stripe } = require("../config/stripe");

const createCheckout = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const userId = req.user.id;

  const user = await getUserProfile(userId);
  const result = await createCheckout(userId, user.email, plan);

  res.json({ url: result.url });
});

const manageSubscription = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await createManagePortal(userId);

  res.json({ url: result.url });
});

const checkSession = asyncHandler(async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: "session_id is required" });
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status === "paid") {
    await activateSubscription(session_id);
    return res.json({ message: "Subscription activated" });
  }

  res.json({ status: session.status });
});

module.exports = { createCheckout, manageSubscription, checkSession };
