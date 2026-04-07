const { prisma } = require("../server");

/**
 * Get paginated generation history for a user
 */
async function getHistory(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;

  const [generations, total] = await Promise.all([
    prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Search generations by topic
 */
async function searchGenerations(userId, query) {
  const generations = await prisma.generation.findMany({
    where: {
      userId,
      topic: {
        contains: query,
        mode: "insensitive",
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
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
