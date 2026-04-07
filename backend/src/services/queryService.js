/**
 * Database Query Optimizations
 *
 * Performance tips applied:
 * - Select only needed fields (avoid SELECT *)
 * - Use indexed columns for WHERE clauses
 * - Batch queries with Promise.all for independent operations
 * - Use Prisma raw queries for complex aggregates
 * - Avoid N+1 queries with proper relations
 */

const { prisma } = require('../server');

/**
 * Get paginated history — optimized with indexed queries
 * Only selects needed fields (no result column transfer)
 */
async function getHistory(userId, { page = 1, limit = 20 } = {}) {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
  const skip = (safePage - 1) * safeLimit;

  // Parallel: fetch data + total count (uses index on userId+createdAt)
  const [generations, total] = await Promise.all([
    prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: safeLimit,
      select: {
        id: true, topic: true, format: true, model: true, createdAt: true,
        // EXCLUDE result (can be large JSON, not needed in list view)
      },
    }),
    prisma.generation.count({ where: { userId } }), // Fast: uses index
  ]);

  return {
    data: generations,
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
}

/**
 * Count today's generations — uses createdAt index
 */
async function countTodayGenerations(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return prisma.generation.count({
    where: { userId, createdAt: { gte: startOfDay } },
  });
}

/**
 * Bulk delete generations — single query, no N+1
 */
async function bulkDeleteGenerations(userId, generationIds) {
  return prisma.generation.deleteMany({
    where: { userId, id: { in: generationIds } },
  });
}

/**
 * Get user stats — batched independent queries
 */
async function getUserStats(userId, periodDays = 30) {
  const since = new Date();
  since.setDate(since.getDate() - periodDays);

  const [totalGenerations, todayCount] = await Promise.all([
    prisma.generation.count({
      where: { userId, createdAt: { gte: since } },
    }),
    countTodayGenerations(userId),
  ]);

  // Raw SQL: daily breakdown in single query (vs 30 separate queries)
  const dailyBreakdown = await prisma.$queryRaw`
    SELECT DATE("createdAt") as date, COUNT(*) as count
    FROM "Generation"
    WHERE "userId" = ${userId}::uuid AND "createdAt" >= ${since}
    GROUP BY DATE("createdAt")
    ORDER BY date DESC
    LIMIT ${periodDays}
  `;

  return { totalGenerations, todayCount, dailyBreakdown };
}

/**
 * Get plan distribution — single GROUP BY query
 */
async function getPlanDistribution() {
  return prisma.user.groupBy({
    by: ['plan'],
    _count: { plan: true },
  });
}

module.exports = { getHistory, countTodayGenerations, bulkDeleteGenerations, getUserStats, getPlanDistribution };
