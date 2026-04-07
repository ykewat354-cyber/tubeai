/**
 * Analytics Service
 *
 * Lightweight user activity tracking — no external dependencies.
 * Stores events in PostgreSQL for dashboard display and business insights.
 *
 * Tracked Events:
 * - page_view — user views a page
 * - content_generated — user generates content (free/pro, model used)
 * - login — successful login
 * - subscription_change — plan changed
 * - history_deleted — generation deleted
 *
 * Usage:
 *   const analytics = require("../services/analyticsService");
 *   await analytics.track("content_generated", userId, { format: "all", model: "gpt-4o" });
 */

const { prisma } = require("../server");
const logger = require("../utils/logger");

/**
 * Track a user event asynchronously (non-blocking)
 * @param {string} event - Event type
 * @param {string} userId - User ID
 * @param {object} [metadata] - Optional event data
 */
async function track(event, userId, metadata = {}) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        userId: userId || null, // Allow anonymous events
        event,
        metadata,
        ip: metadata.ip || null,
        userAgent: metadata.userAgent || null,
      },
    });
  } catch (error) {
    // Don't crash the app if analytics fails — log and continue
    logger.error({ message: "Failed to track event", event, error: error.message });
  }
}

/**
 * Get user activity stats
 * @param {string} userId
 * @param {object} options
 * @param {string} options.period - Days to look back (default: 30)
 * @returns {Promise<object>} Activity summary
 */
async function getUserStats(userId, { period = 30 } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - period);

  const [totalGenerations, recentEvents, dailyBreakdown] = await Promise.all([
    // Total generations in period
    prisma.generation.count({
      where: { userId, createdAt: { gte: since } },
    }),

    // Recent activity events
    prisma.analyticsEvent.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, event: true, metadata: true, createdAt: true },
    }),

    // Daily generation count (for usage chart)
    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "Generation"
      WHERE "userId" = ${userId}::uuid AND "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 30
    `,
  ]);

  return {
    totalGenerations,
    recentEvents,
    dailyBreakdown,
    period,
  };
}

/**
 * Get platform-wide analytics (admin use)
 * @param {object} options
 * @param {number} options.period - Days to look back
 * @returns {Promise<object>} Platform stats
 */
async function getPlatformStats({ period = 30 } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - period);

  const [totalUsers, activeUsers, totalGenerations, planDistribution] = await Promise.all([
    // Total registered users
    prisma.user.count(),

    // Users active in period
    prisma.user.count({
      where: {
        generations: { some: { createdAt: { gte: since } } },
      },
    }),

    // Total generations in period
    prisma.generation.count({
      where: { createdAt: { gte: since } },
    }),

    // Users by plan
    prisma.user.groupBy({
      by: ["plan"],
      _count: { plan: true },
    }),
  ]);

  return {
    totalUsers,
    activeUsers,
    totalGenerations,
    planDistribution,
    period,
  };
}

module.exports = { track, getUserStats, getPlatformStats };
