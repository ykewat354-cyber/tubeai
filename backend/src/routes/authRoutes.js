const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { validate } = require("../middleware/validate");
const { z } = require("zod");
const authController = require("../controllers/authController");

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email().max(100),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.getProfile);

module.exports = router;
