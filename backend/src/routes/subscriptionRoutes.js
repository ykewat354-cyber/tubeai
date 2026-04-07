const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { z } = require("zod");
const subscriptionController = require("../controllers/subscriptionController");

const checkoutSchema = z.object({
  plan: z.enum(["pro", "pro-yearly"]),
});

// All routes require auth
router.use(authenticate);

router.post("/checkout", validate(checkoutSchema), subscriptionController.createCheckout);
router.get("/portal", subscriptionController.manageSubscription);
router.post("/check-session", subscriptionController.checkSession);

module.exports = router;
