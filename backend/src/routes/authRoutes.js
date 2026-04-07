const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { validate } = require("../middleware/validate");
const { z } = require("zod");
const ctrl = require("../controllers/authController");

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email().max(100),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });
const emailSchema = z.object({ email: z.string().email() });

const resetSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  password: z.string().min(8).max(128),
});

router.post("/register", authLimiter, validate(registerSchema), ctrl.register);
router.post("/login", authLimiter, validate(loginSchema), ctrl.login);
router.post("/verify-email", authLimiter, validate(z.object({ token: z.string() })), ctrl.verifyEmail);
router.post("/request-reset", authLimiter, validate(emailSchema), ctrl.requestPasswordReset);
router.post("/reset-password", authLimiter, validate(resetSchema), ctrl.completePasswordReset);
router.get("/me", authenticate, ctrl.getProfile);

module.exports = router;
