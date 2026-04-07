const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhookController");

// Stripe webhooks don't need JSON parsing — use raw body
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  webhookController.handleStripe
);

module.exports = router;
