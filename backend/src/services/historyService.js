/**
 * History service
 * Manages retrieval and searching of user's generation history.
 * Uses pagination to avoid loading large result sets into memory.
 *
 * @module historyService
 */

const { prisma } = require("../server");

/**
 * Get paginated generation history for a user
 * Only returns metadata (no full result) for the list view to minimize payload
 *
 * @param {string} userId - User UUID
 * @param {object} options
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.limit - Items per page (max 100)
 * @returns {Promise<{data: array, pagination: object}>} Paginated generation list
 */
async function getHistory(userId, { page = 1, limit = 20 } = {}) {
  // Clamp values to prevent abuse
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
  const skip = (safePage - 1) * safeLimit;

  // Parallel queries: fetch data + total count
  const [generations, total] = await Promise.all([
    prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
      // Only return what the list view needs — not the full result JSON
      select: {
        id: true,
        topic: true,
        format: true,
        model: true,
        createdAt: true,
      },
    }),
    prisma.generation.count({ where: { userId } }),
  ]);

  return {
    data: generations,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
}

/**
 * Search user's generations by topic (case-insensitive)
 * Uses ILIKE for PostgreSQL (case-insensitive substring match)
 *
 * @param {string} userId - User UUID
 * @param {string} query - Search string
 * @returns {Promise<{data: array, total: number}>} Matched generations
 */
async function searchGenerations(userId, query) {
  const generations = await prisma.generation.findMany({
    where: {
      userId,
      topic: {
        contains: query,
        mode: "insensitive", // PostgreSQL: case-insensitive search
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50, // Limit search results to prevent large payloads
    select: {
      id: true,
      topic: true,
      format: true,
      model: true,
      createdAt: true,
    },
  });

  return { data: generations, total: generations.length };
}

module.exports = { getHistory, searchGenerations };
