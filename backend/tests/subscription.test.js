/**
 * Subscription middleware unit tests
 * Tests usage limits, plan validation, and quota checking
 *
 * Run: npm test -- tests/subscription.test.js
 */

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    user: { findUnique: jest.fn() },
    generation: { count: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { checkUsageLimit, PLAN_LIMITS } = require("../src/middleware/subscription");
const { PrismaClient } = require("@prisma/client");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Subscription Middleware", () => {
  describe("PLAN_LIMITS configuration", () => {
    it("should define limits for all plans", () => {
      expect(PLAN_LIMITS).toHaveProperty("free");
      expect(PLAN_LIMITS).toHaveProperty("pro");
      expect(PLAN_LIMITS).toHaveProperty("pro_yearly");
    });

    it("should have higher limits for paid plans", () => {
      const freeDaily = PLAN_LIMITS.free.generationsPerDay;
      const proDaily = PLAN_LIMITS.pro.generationsPerDay;
      expect(proDaily).toBeGreaterThan(freeDaily);
    });
  });

  describe("checkUsageLimit", () => {
    it("should allow free tier user under limit", async () => {
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue({ plan: "free" });
      prisma.generation.count.mockResolvedValue(2); // Under limit of 3

      const req = { user: { id: "user-1" } };
      const res = {};
      const next = jest.fn();

      await checkUsageLimit(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.planName).toBe("free");
      expect(req.usage.used).toBe(2);
    });

    it("should reject free tier user at limit", async () => {
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue({ plan: "free" });
      prisma.generation.count.mockResolvedValue(3); // At limit of 3

      const req = { user: { id: "user-1" } };
      const resCalls = [];
      const res = {
        status: (code) => ({
          json: (body) => resCalls.push({ status: code, body }),
        }),
      };
      const next = jest.fn();

      await checkUsageLimit(req, res, next);

      expect(resCalls).toHaveLength(1);
      expect(resCalls[0].status).toBe(429);
      expect(resCalls[0].body.error).toContain("Daily limit reached");
      expect(next).not.toHaveBeenCalled();
    });

    it("should allow pro tier user with higher limit", async () => {
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue({ plan: "pro" });
      prisma.generation.count.mockResolvedValue(30); // 30/50 used

      const req = { user: { id: "user-1" } };
      const res = {};
      const next = jest.fn();

      await checkUsageLimit(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.planName).toBe("pro");
      expect(req.planLimits.model).toBe("gpt-4o");
      expect(req.usage.used).toBe(30);
    });
  });
});
