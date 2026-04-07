/**
 * Subscription middleware
 * Checks user's plan and enforces daily generation limits
 */

const { apiResponse } = require("../utils/constants");
const config = require("../config");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Check if user has remaining quota for today
 * Attaches planLimits and usage info to req object
 */
async function checkUsageLimit(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    const plan = user?.plan || "free";
    const limits = config.plans[plan];

    if (!limits) {
      return res.status(403).json(
        apiResponse(false, "Invalid subscription plan.")
      );
    }

    // Count today's generations using efficient date range query
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await prisma.generation.count({
      where: { userId, createdAt: { gte: startOfDay } },
    });

    if (todayCount >= limits.generationsPerDay) {
      return res.status(429).json(
        apiResponse(false, `Daily limit reached (${limits.generationsPerDay} generations/day).`, null, {
          limit: limits.generationsPerDay,
          used: todayCount,
          plan,
        })
      );
    }

    req.planLimits = limits;
    req.planName = plan;
    req.usage = { used: todayCount, limit: limits.generationsPerDay };
    next();
  } catch (err) {
    console.error("Usage limit check failed:", err);
    next(err);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { checkUsageLimit };
