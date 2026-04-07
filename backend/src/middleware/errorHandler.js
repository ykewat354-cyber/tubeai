/**
 * Global error handling middleware
 * Catches all errors thrown by route handlers and middleware
 *
 * Maps known error codes to appropriate HTTP status codes
 * In production mode, hides stack traces from response
 */

const logger = require("../utils/logger");

/**
 * @typedef {object} AppError
 * @property {string} message - Human-readable error message
 * @property {number} [statusCode] - HTTP status code (default: 500)
 * @property {string} [code] - Internal error code (e.g., Prisma P2002)
 * @property {string} [type] - Error type (e.g., StripeCardError)
 * @property {object} [meta] - Additional error metadata
 */

/**
 * Global error handler middleware
 * @param {AppError} err - The caught error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  logger.error({
    message: err.message || "Unknown error",
    path: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode || 500,
  });

  // Prisma unique constraint violation
  if (err.code === "P2002") {
    return res.status(409).json({
      error: "A record with this value already exists.",
      field: err.meta?.target?.[0],
    });
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found." });
  }

  // Stripe API errors
  if (err.type?.startsWith("Stripe")) {
    return res.status(400).json({ error: err.message });
  }

  // OpenAI API errors
  if (err.message?.includes("OpenAI") || err.status === 429) {
    return res.status(503).json({
      error: "AI service temporarily unavailable. Please try again.",
    });
  }

  // Zod validation errors (should be caught by validate middleware, but fallback here)
  if (err.errors && Array.isArray(err.errors)) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.errors,
    });
  }

  // Default: 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" && statusCode === 500
    ? "Internal server error"
    : err.message || "Something went wrong";

  res.status(statusCode).json({ error: message });
}

/**
 * Async handler wrapper
 * Wraps async route handlers to catch promise rejections and forward to error middleware
 * Eliminates the need for try/catch in every controller
 *
 * @param {Function} fn - The async route handler to wrap
 * @returns {Function} Express middleware function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, asyncHandler };
