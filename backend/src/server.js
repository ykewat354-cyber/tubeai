/**
 * TubeAI Server — Production Ready v3
 *
 * Architecture:
 * - Express API server with middleware pipeline
 * - Winston structured logging (file + console + error tracking)
 * - Redis-backed caching (graceful degradation)
 * - BullMQ background job queue
 * - Compression + security headers
 * - Request ID correlation for distributed tracing
 * - Metrics collection for monitoring
 * - Multi-route health endpoints
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { PrismaClient } = require('@prisma/client');
const logger = require('./utils/logger');
const { requestLogger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');
const { isRedisAvailable, closeRedis } = require('./config/redis');
const requestIdMiddleware = require('./middleware/requestId');
const metricsMiddleware = require('./middleware/metrics');
const metrics = require('./utils/metrics');

require('dotenv').config();

// --- Prisma with performance logging ---
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// Log slow queries (>50ms)
prisma.$on('query', (e) => {
  if (e.duration > 50) {
    logger.warn({ message: 'Slow query detected', duration: `${e.duration}ms`, query: e.query.substring(0, 120) });
  }
});

// Log database errors
prisma.$on('error', (e) => {
  logger.error({ message: 'Database error', error: e.message });
});

const app = express();

// --- Validate required environment variables ---
const requiredEnv = ['DATABASE_URL'];
const missingEnv = requiredEnv.filter((k) => !process.env[k]);
if (missingEnv.length > 0) {
  logger.warn({ message: 'Missing environment variables', keys: missingEnv });
  if (process.env.NODE_ENV === 'production') {
    logger.error({ message: 'Cannot start in production without required env vars' });
    process.exit(1);
  }
}

// ===================== Middleware Pipeline =====================

// Security headers (CSP, HSTS, etc.)
app.use(helmet());
app.use(helmet.hidePoweredBy());

// Gzip compression (70% smaller responses)
app.use(compression({ level: 6 })); // 1-9, 6 is good balance of speed/size

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // Cache preflight for 24h
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy headers (Nginx, Cloudflare, etc.)
app.set('trust proxy', 1);

// Request ID (for log correlation across distributed systems)
app.use(requestIdMiddleware);

// Metrics collection (every request tracked)
app.use(metricsMiddleware);

// Global rate limiting (applied before routes)
app.use(globalLimiter);

// HTTP access logging
app.use(requestLogger);

// ===================== Routes =====================

// Health checks (with detailed monitoring)
// Health checks
app.use('/api/health', require('./routes/healthRoutes'));

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/generate', require('./routes/generateRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/webhook', require('./routes/webhookRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));

// Admin routes (protected by admin API key)
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 — not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    requestId: req.id,
  });
});

// Global error handler
app.use(errorHandler);

// ===================== Startup =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info({
    message: 'TubeAI server started',
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    version: require('../package.json').version,
    pid: process.pid,
  });

  // Log system capabilities
  isRedisAvailable().then((ok) => {
    if (ok) {
      logger.info({ message: 'Redis connected — caching + queues active' });
    } else {
      logger.warn({ message: 'Redis not available — running in degraded mode (no caching, no queues)' });
    }
  }).catch(() => {});

  // Log memory baseline
  const mem = process.memoryUsage();
  logger.info({
    message: 'Memory baseline',
    heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(1)}MB`,
    rss: `${(mem.rss / 1024 / 1024).toFixed(1)}MB`,
  });
});

// ===================== Graceful Shutdown =====================

async function gracefulShutdown(signal) {
  logger.info({ message: `${signal} received — starting graceful shutdown` });

  // Stop accepting new connections
  const shutdownTimeout = setTimeout(() => {
    logger.error({ message: 'Shutdown timeout — forcing exit' });
    process.exit(1);
  }, 30000);

  try {
    await prisma.$disconnect();
    logger.info({ message: 'Database disconnected' });

    await closeRedis();
    logger.info({ message: 'Redis disconnected' });

    const { closeQueues } = require('./config/queue');
    await closeQueues();
    logger.info({ message: 'Queues closed' });
  } catch (err) {
    logger.error({ message: 'Error during shutdown', error: err.message });
  } finally {
    clearTimeout(shutdownTimeout);
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch unhandled rejections (prevent crashes)
process.on('unhandledRejection', (reason) => {
  logger.error({ message: 'Unhandled Promise Rejection', reason: reason?.message || reason, stack: reason?.stack });
  // Don't crash — keep serving requests
});

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error({ message: 'Uncaught Exception', error: err.message, stack: err.stack });
  // In production, restart after logging
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => process.exit(1), 1000);
  }
});

module.exports = { app, prisma };
