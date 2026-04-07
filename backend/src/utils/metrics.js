/**
 * Metrics Collector — Performance, Errors, API Usage Tracking
 *
 * Lightweight in-memory metrics system with periodic flush to Redis.
 *
 * Tracked:
 * - HTTP request rates per endpoint + status distribution
 * - Response time percentiles (p50, p95, p99)
 * - Error rates (by type + endpoint)
 * - Queue processing rates + success/failure
 * - Cache hit/miss ratios
 * - Memory usage tracking (prevent leaks)
 *
 * Usage:
 *   const metrics = require("./utils/metrics");
 *   metrics.recordRequest('POST /generate', 1500, 200);
 *   metrics.recordError('GenerationError');
 *   metrics.getSummary(); // → { requests, errors, latencies, memory }
 */

const { getRedisClient, isRedisAvailable } = require('../config/redis');
const logger = require('./logger');

// In-memory counters (reset on flush)
let metrics = {
  requests: {},          // { "POST /generate": { count: 100, totalMs: 150000, errors: 3 } }
  errors: {},            // { "GenerationError": 5 }
  cache: { hits: 0, misses: 0 },
  queue: { completed: 0, failed: 0, active: 0 },
  startTime: Date.now(),
  lastFlush: Date.now(),
  samples: [],           // Rolling window of response times (for percentile calc)
};

const MAX_SAMPLES = 10000; // Keep last 10k samples for percentile accuracy

/**
 * Record an HTTP request metric
 * @param {string} route - e.g. "POST /generate"
 * @param {number} durationMs - Request duration
 * @param {number} statusCode - HTTP status code
 */
function recordRequest(route, durationMs, statusCode) {
  if (!metrics.requests[route]) {
    metrics.requests[route] = { count: 0, totalMs: 0, errors: 0 };
  }

  const r = metrics.requests[route];
  r.count++;
  r.totalMs += durationMs;

  if (statusCode >= 400) r.errors++;

  // Rolling sample for percentile calculation
  if (metrics.samples.length < MAX_SAMPLES) {
    metrics.samples.push(durationMs);
  } else {
    // Replace oldest 10% with new samples (circular buffer approximation)
    const idx = Math.floor(Math.random() * metrics.samples.length);
    metrics.samples[idx] = durationMs;
  }
}

/**
 * Record an error
 */
function recordError(type, context = {}) {
  if (!metrics.errors[type]) metrics.errors[type] = 0;
  metrics.errors[type]++;
  logger.error({ message: 'Error recorded in metrics', type, ...context });
}

/**
 * Record cache hit/miss
 */
function recordCacheHit(hit) {
  if (hit) metrics.cache.hits++;
  else metrics.cache.misses++;
}

/**
 * Record queue metric
 */
function recordQueueResult(success) {
  if (success) metrics.queue.completed++;
  else metrics.queue.failed++;
}

/**
 * Calculate percentiles from samples
 */
function calculatePercentiles() {
  if (metrics.samples.length === 0) return { p50: 0, p95: 0, p99: 0 };

  const sorted = [...metrics.samples].sort((a, b) => a - b);
  const len = sorted.length;
  return {
    p50: sorted[Math.floor(len * 0.50)],
    p95: sorted[Math.floor(len * 0.95)],
    p99: sorted[Math.floor(len * 0.99)],
  };
}

/**
 * Get current memory usage (Node.js native)
 */
function getMemoryUsage() {
  const mem = process.memoryUsage();
  return {
    rss: `${(mem.rss / 1024 / 1024).toFixed(1)}MB`,
    heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(1)}MB`,
    heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(1)}MB`,
    external: `${(mem.external / 1024 / 1024).toFixed(1)}MB`,
  };
}

/**
 * Get full metrics summary
 */
function getSummary() {
  const uptime = (Date.now() - metrics.startTime) / 1000;
  const perRouteStats = {};

  for (const [route, data] of Object.entries(metrics.requests)) {
    perRouteStats[route] = {
      count: data.count,
      avgMs: data.count > 0 ? Math.round(data.totalMs / data.count) : 0,
      totalMs: data.totalMs,
      errors: data.errors,
      errorRate: data.count > 0 ? ((data.errors / data.count) * 100).toFixed(1) + '%' : '0%',
    };
  }

  return {
    uptime: `${Math.floor(uptime)}s`,
    requestsPerRoute: perRouteStats,
    errors: metrics.errors,
    cache: {
      hits: metrics.cache.hits,
      misses: metrics.cache.misses,
      hitRate: (metrics.cache.hits + metrics.cache.misses) > 0
        ? ((metrics.cache.hits / (metrics.cache.hits + metrics.cache.misses)) * 100).toFixed(1) + '%'
        : 'N/A',
    },
    queue: metrics.queue,
    latencies: calculatePercentiles(),
    memory: getMemoryUsage(),
    sinceLastFlush: `${Math.floor((Date.now() - metrics.lastFlush) / 1000)}s`,
  };
}

/**
 * Flush metrics to Redis (for multi-instance aggregation)
 * Called periodically by timer
 */
async function flushToRedis() {
  const available = await isRedisAvailable();
  if (!available) return;

  try {
    const redis = getRedisClient();
    const key = `metrics:${Date.now()}`;
    await redis.setex(key, 86400 * 7, JSON.stringify(getSummary())); // 7-day retention
    logger.debug({ message: 'Metrics flushed to Redis', key });
  } catch (err) {
    logger.error({ message: 'Failed to flush metrics to Redis', error: err.message });
  }
}

/**
 * Check for memory leaks — alert if heap exceeds threshold
 */
function checkMemoryHealth(thresholdMB = 500) {
  const mem = process.memoryUsage();
  const heapMB = mem.heapUsed / 1024 / 1024;

  if (heapMB > thresholdMB) {
    logger.error({
      message: 'Memory usage exceeds threshold — possible leak',
      heapUsed: `${heapMB.toFixed(1)}MB`,
      threshold: `${thresholdMB}MB`,
      full: getMemoryUsage(),
    });
    return false;
  }
  return true;
}

// Auto-flush metrics every 5 minutes in production
let flushInterval = null;
if (process.env.NODE_ENV === 'production') {
  flushInterval = setInterval(flushToRedis, 5 * 60 * 1000);
}

// Auto-check memory every 60 seconds
const memCheck = setInterval(() => {
  checkMemoryHealth(parseInt(process.env.MEMORY_ALERT_THRESHOLD_MB, 10) || 500);
}, 60 * 1000);

module.exports = {
  recordRequest,
  recordError,
  recordCacheHit,
  recordQueueResult,
  getSummary,
  flushToRedis,
  checkMemoryHealth,
  getMemoryUsage,
  _reset() { // For testing only
    clearInterval(flushInterval);
    clearInterval(memCheck);
    metrics = { requests: {}, errors: {}, cache: { hits: 0, misses: 0 }, queue: { completed: 0, failed: 0, active: 0 }, startTime: Date.now(), lastFlush: Date.now(), samples: [] };
  },
};
