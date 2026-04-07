/**
 * TubeAI Server Entry Point — Production Ready
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { PrismaClient } = require("@prisma/client");
const logger = require("./utils/logger");
const { requestLogger } = require("./utils/logger");
const { errorHandler } = require("./middleware/errorHandler");
const { globalLimiter } = require("./middleware/rateLimiter");

require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// Validate required env on startup
const required = ["DATABASE_URL"];
for (const key of required) {
  if (!process.env[key]) {
    logger.error({ message: `Missing env variable: ${key}` });
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}

// Security
app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

// Global rate limiter
app.use(globalLimiter);

// HTTP request logging
app.use(requestLogger);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime(), env: process.env.NODE_ENV });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/generate", require("./routes/generateRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/subscription", require("./routes/subscriptionRoutes"));
app.use("/api/webhook", require("./routes/webhookRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found", path: req.originalUrl });
});

// Global error handler
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info({ message: "TubeAI server started", port: PORT, env: process.env.NODE_ENV || "development" });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info({ message: "SIGTERM received — shutting down" });
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info({ message: "SIGINT received — shutting down" });
  await prisma.$disconnect();
  process.exit(0);
});

// Catch unhandled promise rejections (prevent crashes)
process.on("unhandledRejection", (reason) => {
  logger.error({ message: "Unhandled Promise Rejection", reason: reason?.message || reason });
  // Don't exit — keep server running for other requests
});

module.exports = { app, prisma };
