/**
 * TubeAI Server Entry Point
 * Express application with modular middleware and route structure
 *
 * @module server
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { PrismaClient } = require("@prisma/client");
const { errorHandler } = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// Load environment variables
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

/**
 * Security & CORS middleware
 * helmet: adds HTTP security headers
 * cors: restricts access to configured frontend origin
 */
app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON bodies (capped at 10MB to prevent abuse)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Trust reverse proxy headers (Nginx, Cloudflare, etc.)
app.set("trust proxy", 1);

// Health check (used by load balancers and uptime monitors)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ===== Routes =====
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/generate", require("./routes/generateRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/subscription", require("./routes/subscriptionRoutes"));
app.use("/api/webhook", require("./routes/webhookRoutes"));

// 404 handler for unrecognized routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

// ===== Start Server =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info({
    message: "TubeAI server started",
    port: PORT,
    environment: process.env.NODE_ENV || "development",
  });
});

// Graceful shutdown — disconnects DB connections before exit
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received: Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received: Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { app, prisma };
