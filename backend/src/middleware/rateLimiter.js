/**
 * Rate Limiting + Abuse Protection
 *
 * Multi-layer defense:
 * 1. Global limiter (all endpoints)
 * 2. Per-endpoint limiters (auth, generation)
 * 3. Redis-backed distributed rate limiting (if Redis available)
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const { isRedisAvailable, getRedisClient } = require('../config/redis');

// Fallback in-memory store (used when Redis is unavailable)
const MemStore = require('express-rate-limit/dist/memory-store.js')
  ?.default || require('express-rate-limit');

/** Create a Redis-backed or in-memory rate limiter */
async function createLimiter(options) {
  const useRedis = await isRedisAvailable();

  if (useRedis) {
    const RedisStore = require('rate-limit-redis');
    return rateLimit({
      ...options,
      store: new RedisStore({
        sendCommand: (...args) => getRedisClient().call(...args),
      }),
    });
  }

  return rateLimit(options);
}

// Static limiters (initialized at startup)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many generation requests. Try again in 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ message: 'Generation rate limit hit', ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'Too many generation requests. Please wait.',
      retryAfterSec: 60,
    });
  },
});

// Global limiter for all API routes
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health',
});

// Strict limiter — webhook endpoint
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many webhook requests.' },
  keyGenerator: (req) => req.ip,
});

module.exports = { authLimiter, generateLimiter, globalLimiter, webhookLimiter, createLimiter };
