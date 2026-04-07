const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { PrismaClient } = require("@prisma/client");
const { errorHandler } = require("./middleware/errorHandler");

// Load environment variables
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// ===== Middleware =====
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===== Routes =====
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/generate", require("./routes/generateRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/subscription", require("./routes/subscriptionRoutes"));
app.use("/api/webhook", require("./routes/webhookRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorHandler);

// ===== Start Server =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ TubeAI server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM: Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { app, prisma };
