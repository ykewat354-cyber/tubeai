const { prisma } = require("../server");

// Usage limits per plan
const PLAN_LIMITS = {
  free: { generationsPerDay: 3, model: "gpt-4o-mini" },
  pro: { generationsPerDay: 50, model: "gpt-4o" },
  pro_yearly: { generationsPerDay: 50, model: "gpt-4o" },
};

/**
 * Check if user has remaining quota for today
 */
async function checkUsageLimit(req, res, next) {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, stripeCustomerId: true },
    });

    const plan = user.plan || "free";
    const limits = PLAN_LIMITS[plan];

    if (!limits) {
      return res.status(403).json({ error: "Invalid subscription plan." });
    }

    // Count today's generations
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await prisma.generation.count({
      where: {
        userId,
        createdAt: { gte: startOfDay },
      },
    });

    if (todayCount >= limits.generationsPerDay) {
      return res.status(429).json({
        error: `Daily limit reached (${limits.generationsPerDay} generations/day).`,
        limit: limits.generationsPerDay,
        used: todayCount,
        plan,
        upgradeHint: "Upgrade to Pro for more generations",
      });
    }

    // Attach plan info to request
    req.planLimits = limits;
    req.planName = plan;
    req.usage = { used: todayCount, limit: limits.generationsPerDay };

    next();
  } catch (err) {
    console.error("Usage limit check failed:", err);
    next(err);
  }
}

module.exports = { checkUsageLimit, PLAN_LIMITS };
