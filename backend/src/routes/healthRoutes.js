/**
 * Health Check & Monitoring Routes
 *
 * Endpoints:
 * - GET /api/health — Basic health (Redis, DB, uptime)
 * - GET /api/health/detailed — Full system diagnostics
 * - GET /api/health/metrics — Performance metrics (latencies, error rates, memory)
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../server');
const { isRedisAvailable } = require('../config/redis');
const { getSummary: getMetricsSummary, getMemoryUsage, checkMemoryHealth } = require('../utils/metrics');
const { getQueueStats } = require('../config/queue');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/health — Basic health check
 * Fast: just checks if service is up, Redis is reachable, DB responds
 */
router.get('/', async (req, res) => {
  try {
    const [redisOk, dbOk] = await Promise.all([
      isRedisAvailable().catch(() => false),
      prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
    ]);

    const allHealthy = redisOk && dbOk;

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: require('../../package.json').version,
      services: { redis: redisOk, database: dbOk },
    });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

/**
 * GET /api/health/detailed — Full system diagnostics
 */
router.get('/detailed', asyncHandler(async (req, res) => {
  const [redisOk, dbOk] = await Promise.all([
    isRedisAvailable().catch(() => false),
    prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
  ]);

  // Queue stats (non-blocking)
  let queueStats = null;
  try { queueStats = await getQueueStats(); } catch { /* queue might be down */ }

  // Memory check
  const memOk = checkMemoryHealth();
  const memory = getMemoryUsage();

  // Database table sizes
  let dbSize = null;
  try {
    const [count] = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`;
    dbSize = count.size;
  } catch { /* ignore */ }

  res.json({
    status: (redisOk && dbOk && memOk) ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('../../package.json').version,
    environment: process.env.NODE_ENV,
    services: {
      redis: redisOk,
      database: dbOk,
      queue: queueStats ? 'connected' : 'disconnected',
    },
    system: {
      memory,
      pid: process.pid,
      nodeVersion: process.version,
      uptimeFormatted: formatUptime(process.uptime()),
    },
    database: { size: dbSize },
    queue: queueStats,
  });
}));

/**
 * GET /api/health/metrics — Real-time performance metrics
 */
router.get('/metrics', asyncHandler(async (req, res) => {
  const summary = getMetricsSummary();

  res.json({
    timestamp: new Date().toISOString(),
    metrics: summary,
  });
}));

function formatUptime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
}

module.exports = router;
