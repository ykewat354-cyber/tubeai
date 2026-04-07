/**
 * Redis API Response Caching Middleware
 *
 * For expensive GET endpoints (user profile, history, etc.)
 * - Caches JSON response with configurable TTL
 * - Invalidates on POST/PUT/DELETE
 * - Graceful degradation (falls through to DB if Redis down)
 *
 * Usage:
 *   const { cache, invalidateCache } = require('./middleware/cache');
 *   router.get('/me', cache('user-profile', 300), authController.getProfile);
 *   router.post('/generate', invalidateCache(/user:*/), controller.generate);
 */

const { getRedisClient, isRedisAvailable } = require('../config/redis');
const logger = require('../utils/logger');

const CACHE_PREFIX = 'tubeapi:';

/** Cache key builder: prefix + user_id + path */
function buildKey(req, suffix) {
  const userId = req.user?.id || `anon:${req.ip}`;
  return `${CACHE_PREFIX}${userId}:${suffix || req.originalUrl}`;
}

/**
 * Cache middleware for GET requests
 * @param {string} suffix - Cache key suffix (useful for URLs with params)
 * @param {number} ttl - Cache TTL in seconds (default: 60)
 */
function cache(suffix = null, ttl = 60) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const redisAvailable = await isRedisAvailable();
    if (!redisAvailable) {
      // Redis down — pass through to DB (graceful degradation)
      logger.debug({ message: 'Redis unavailable, skipping cache' });
      return next();
    }

    const redis = getRedisClient();
    const key = buildKey(req, suffix);

    try {
      // Try cache hit
      const cached = await redis.get(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        logger.debug({ message: 'Cache HIT', key });
        return res.json(parsed);
      }
    } catch (err) {
      logger.error({ message: 'Cache read error', key, error: err.message });
      // Fall through to DB on cache error
      return next();
    }

    // Intercept res.json to also write to cache
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis.set(key, JSON.stringify(body), 'EX', ttl).catch((err) => {
          logger.error({ message: 'Cache write error', key, error: err.message });
        });
      }
      return originalJson(body);
    };

    next();
  };
}

/**
 * Cache invalidation middleware
 * Used after mutation endpoints to clear relevant caches
 * @param {RegExp|string} pattern - Key pattern to invalidate
 */
function invalidateCache(pattern) {
  return async (req, res, next) => {
    // Call the original res.json first, then invalidate
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      invalidatePattern(req, pattern).catch(() => {});
      return originalJson(body);
    };
    next();
  };
}

/**
 * Invalidate cache keys matching a pattern
 * @param {object} req
 * @param {RegExp|string} pattern
 */
async function invalidatePattern(req, pattern) {
  const redisAvailable = await isRedisAvailable();
  if (!redisAvailable) return;

  const redis = getRedisClient();
  const userId = req.user?.id || `anon:${req.ip}`;
  const baseKey = `${CACHE_PREFIX}${userId}:`;

  try {
    // SCAN for matching keys (safer than KEYS)
    const stream = redis.scanStream({ match: baseKey + (typeof pattern === 'string' ? pattern : '*') });
    let deleted = 0;

    stream.on('data', async (keys) => {
      if (keys.length > 0) {
        await redis.del(keys);
        deleted += keys.length;
      }
    });

    stream.on('end', () => {
      if (deleted > 0) logger.info({ message: 'Cache invalidated', count: deleted });
    });
  } catch (err) {
    logger.error({ message: 'Cache invalidation error', error: err.message });
  }
}

/**
 * Simple helper: clear all cache for current user
 */
async function clearUserCache(req) {
  await invalidatePattern(req, '*');
}

module.exports = { cache, invalidateCache, clearUserCache };
