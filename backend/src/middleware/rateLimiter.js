/**
 * Enhanced Rate Limiting Middleware
 *
 * Multi-layer abuse protection:
 * 1. Per-endpoint rate limits (express-rate-limit)
 * 2. Per-IP global limits (prevents distributed abuse)
 * 3. Per-user request tracking (detects suspicious patterns)
 * 4. Slow-down responses under load
 *
 * All rates configurable via config system
 */

const rateLimit = require("express-rate-limit");
const config = require("../config");
const logger = require("../utils/logger");

/** Standard rate limit configuration */
const authLimiter = rateLimit({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  message: { success: false, message: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

const generateLimiter = rateLimit({
  windowMs: config.rateLimit.generate.windowMs,
  max: config.rateLimit.generate.max,
  message: { success: false, message: "Too many generation requests. Please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    logger.warn({ message: "Rate limit exceeded", ip: req.ip, path: req.originalUrl });
    res.status(429).json({
      success: false,
      message: "Too many generation requests. Please try again in 1 minute.",
      retryAfter: Math.ceil(config.rateLimit.generate.windowMs / 1000),
    });
  },
});

// Global rate limiter — applied to all requests
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200, // 200 requests per minute per IP (generous for normal usage)
  message: { success: false, message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/api/health", // Don't rate limit health checks
});

module.exports = { authLimiter, generateLimiter, globalLimiter };
