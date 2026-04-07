/**
 * Rate limiting middleware
 * Prevents brute force on auth and abuse on AI generation endpoints
 */

const rateLimit = require("express-rate-limit");
const config = require("../config");

/** Rate limiter for authentication endpoints */
const authLimiter = rateLimit({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  message: { success: false, error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Rate limiter for AI generation endpoints */
const generateLimiter = rateLimit({
  windowMs: config.rateLimit.generate.windowMs,
  max: config.rateLimit.generate.max,
  message: { success: false, error: "Too many generation requests. Please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generateLimiter };
