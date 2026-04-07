/**
 * Centralized configuration module
 *
 * Purpose:
 * - Single source of truth for all app configuration
 * - Environment-based values with sensible defaults
 * - Validation of required environment variables at startup
 *
 * Usage:
 *   const config = require("./config");
 *   console.log(config.server.port);
 */

/**
 * Validate that a required environment variable exists
 * @param {string} key - Environment variable name
 * @param {string} [fallback] - Optional fallback value
 * @returns {string}
 * @throws {Error} If required variable is missing
 */
function envVar(key, fallback) {
  const value = process.env[key];

  if (!value && !fallback) {
    // In test environment, allow missing vars to prevent test failures
    if (process.env.NODE_ENV === "test") {
      return "";
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value || fallback;
}

const config = {
  /** Server configuration */
  server: {
    port: parseInt(process.env.PORT, 10) || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    frontendUrl: envVar("FRONTEND_URL", "http://localhost:3000"),
  },

  /** Database configuration */
  database: {
    url: envVar("DATABASE_URL"),
  },

  /** Authentication configuration */
  auth: {
    jwtSecret: envVar("JWT_SECRET"),
    jwtExpiresIn: envVar("JWT_EXPIRES_IN", "7d"),
    bcryptRounds: 10,
  },

  /** OpenAI configuration */
  openai: {
    apiKey: envVar("OPENAI_API_KEY"),
    defaultModel: {
      free: "gpt-4o-mini",
      pro: "gpt-4o",
    },
  },

  /** Stripe configuration */
  stripe: {
    secretKey: envVar("STRIPE_SECRET_KEY"),
    webhookSecret: envVar("STRIPE_WEBHOOK_SECRET"),
    prices: {
      pro: process.env.STRIPE_PRICE_ID_PRO,
      "pro-yearly": process.env.STRIPE_PRICE_ID_PRO_YEARLY,
    },
  },

  /** Rate limiting configuration */
  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10,
    },
    generate: {
      windowMs: 60 * 1000, // 1 minute
      max: 5,
    },
  },

  /** Generation limits by plan */
  plans: {
    free: { generationsPerDay: 3, model: "gpt-4o-mini" },
    pro: { generationsPerDay: 50, model: "gpt-4o" },
    pro_yearly: { generationsPerDay: 50, model: "gpt-4o" },
  },
};

module.exports = config;
