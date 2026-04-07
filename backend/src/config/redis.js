/**
 * Redis Configuration & Connection Pool
 *
 * Uses:
 * - API response caching
 * - Distributed rate limiting
 * - BullMQ job queue backing store
 *
 * Setup:
 *   REDIS_URL=redis://localhost:6379
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

function getRedisClient() {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        logger.error({ message: 'Redis failed after 3 retries', fallback: 'in-memory' });
        return null;
      }
      return Math.min(times * 200, 1000);
    },
    lazyConnect: true,
    enableOfflineQueue: true,
  });

  redisClient.on('connect', () => { logger.info({ message: 'Redis connecting', url: redisUrl }); });
  redisClient.on('ready', () => { logger.info({ message: 'Redis ready' }); });
  redisClient.on('error', (err) => { logger.error({ message: 'Redis error', error: err.message }); });

  return redisClient;
}

/** Get or create a Redis instance, auto-connecting if needed */
async function ensureRedis() {
  const client = getRedisClient();
  if (client.status !== 'ready' && client.status !== 'connecting') {
    try { await client.connect(); } catch { return null; }
  }
  return client;
}

async function isRedisAvailable() {
  try {
    const client = await ensureRedis();
    if (!client || client.status !== 'ready') return false;
    return (await client.ping()) === 'PONG';
  } catch { return false; }
}

async function closeRedis() {
  if (redisClient && redisClient.status !== 'end') {
    await redisClient.quit();
    logger.info({ message: 'Redis connection closed' });
  }
}

module.exports = { getRedisClient, ensureRedis, isRedisAvailable, closeRedis };
