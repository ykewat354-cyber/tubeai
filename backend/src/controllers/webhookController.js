const Stripe = require("stripe");
const { asyncHandler } = require("../middleware/errorHandler");
const { prisma } = require("../server");
const { cancelSubscription } = require("../services/subscriptionService");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

function verifyStripeWebhook(req) {
  const sig = req.headers["stripe-signature"];

  try {
    return stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
}

const handleStripe = asyncHandler(async (req, res) => {
  const event = verifyStripeWebhook(req);

  console.log("📦 Stripe webhook received:", event.type);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;
      const customerId = session.customer;

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          stripeCustomerId: customerId,
          stripeSubId: session.subscription,
          subscriptionEnd: new Date(session.expires_at * 1000),
        },
      });

      console.log("✅ Subscription activated for user:", userId);
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
      await cancelSubscription(subscription.customer);
      console.log("❌ Subscription cancelled for customer:", subscription.customer);
      break;
    }

    default:
      console.log("⚠️ Unhandled event type:", event.type);
  }

  res.json({ received: true });
});

module.exports = { handleStripe };
