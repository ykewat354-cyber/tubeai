const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per window
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for AI generation endpoints
 */
const generateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // max 5 generations per minute
  message: { error: "Too many generation requests. Please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generateLimiter };
