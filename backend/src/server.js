/**
 * TubeAI Server — Scalable Production Ready
 *
 * Features:
 * - Redis-backed caching middleware
 * - BullMQ background job processing
 * - Distributed rate limiting (Redis)
 * - Database query optimizations
 * - Graceful degradation (works without Redis)
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

require('dotenv').config();

const app = express();
const prisma = new PrismaClient({
  // Performance: log slow queries
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 50) {
    logger.warn({ message: 'Slow query', duration: `${e.duration}ms`, query: e.query.substring(0, 100) });
  }
});

prisma.$on('error', (e) => {
  logger.error({ message: 'Database error', error: e.message });
});

// Validate required env on startup
const required = ['DATABASE_URL'];
for (const key of required) {
  if (!process.env[key]) {
    logger.error({ message: `Missing env variable: ${key}` });
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
}

// Security + performance
app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(compression()); // Gzip responses
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

// Global rate limiter
app.use(globalLimiter);

// HTTP request logging
app.use(requestLogger);

// Health check (with Redis + DB info)
app.get('/api/health', async (_req, res) => {
  const [redisOk, dbOk] = await Promise.all([
    isRedisAvailable().catch(() => false),
    prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
  ]);

  res.json({
    status: redisOk && dbOk ? 'healthy' : 'degraded',
    services: { redis: redisOk, database: dbOk },
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/generate', require('./routes/generateRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/webhook', require('./routes/webhookRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl });
});

app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info({ message: 'TubeAI server started', port: PORT, env: process.env.NODE_ENV || 'development' });

  // Log system capabilities
  isRedisAvailable().then((ok) => {
    logger.info({ message: 'Redis status', connected: ok, note: ok ? 'caching + queues active' : 'running without Redis (limited)' });
  });
});

// Graceful shutdown
async function shutdown() {
  logger.info({ message: 'Shutting down...' });
  await prisma.$disconnect();
  await closeRedis();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('unhandledRejection', (reason) => {
  logger.error({ message: 'Unhandled rejection', reason: reason?.message || reason });
});

module.exports = { app, prisma };
