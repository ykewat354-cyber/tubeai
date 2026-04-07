/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error("❌ Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({
      error: "A record with this value already exists.",
      field: err.meta?.target?.[0],
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found." });
  }

  // Stripe errors
  if (err.type?.startsWith("Stripe")) {
    return res.status(400).json({ error: err.message });
  }

  // OpenAI errors
  if (err.message?.includes("OpenAI")) {
    return res.status(503).json({ error: "AI service temporarily unavailable. Try again." });
  }

  // Default: 500
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" && statusCode === 500
    ? "Internal server error"
    : err.message;

  res.status(statusCode).json({ error: message });
}

/**
 * Async error wrapper — catches promise rejections
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, asyncHandler };
