/**
 * History service
 * Manages retrieval and search of user's generation history
 */

const { prisma } = require("../server");

/**
 * Get paginated generation history (metadata only, no full result payloads)
 * @param {string} userId
 * @param {object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<{data: array, pagination: object}>}
 */
async function getHistory(userId, { page = 1, limit = 20 } = {}) {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
  const skip = (safePage - 1) * safeLimit;

  const [generations, total] = await Promise.all([
    prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
      select: {
        id: true, topic: true, format: true, model: true, createdAt: true,
      },
    }),
    prisma.generation.count({ where: { userId } }),
  ]);

  return {
    data: generations,
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
}

/**
 * Search generations by topic (case-insensitive)
 * @param {string} userId
 * @param {string} query
 * @returns {Promise<{data: array, total: number}>}
 */
async function searchGenerations(userId, query) {
  const generations = await prisma.generation.findMany({
    where: {
      userId,
      topic: { contains: query, mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, topic: true, format: true, model: true, createdAt: true,
    },
  });

  return { data: generations, total: generations.length };
}

module.exports = { getHistory, searchGenerations };
