/**
 * Subscription middleware tests
 */

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    user: { findUnique: jest.fn() },
    generation: { count: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock("../src/config", () => ({
  plans: {
    free: { generationsPerDay: 3, model: "gpt-4o-mini" },
    pro: { generationsPerDay: 50, model: "gpt-4o" },
    pro_yearly: { generationsPerDay: 50, model: "gpt-4o" },
  },
}));

const { checkUsageLimit } = require("../src/middleware/subscription");
const { PrismaClient } = require("@prisma/client");

beforeEach(() => { jest.clearAllMocks(); });

describe("Subscription Middleware", () => {
  it("should allow free tier user under limit", async () => {
    const prisma = new PrismaClient();
    prisma.user.findUnique.mockResolvedValue({ plan: "free" });
    prisma.generation.count.mockResolvedValue(2);

    const req = { user: { id: "user-1" } };
    const res = {};
    const next = jest.fn();

    await checkUsageLimit(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.planName).toBe("free");
  });

  it("should reject free tier user at limit with 429", async () => {
    const prisma = new PrismaClient();
    prisma.user.findUnique.mockResolvedValue({ plan: "free" });
    prisma.generation.count.mockResolvedValue(3);

    const resJson = jest.fn();
    const req = { user: { id: "user-1" } };
    const res = { status: jest.fn().mockReturnThis(), json: resJson };
    const next = jest.fn();

    await checkUsageLimit(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(resJson).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow pro tier user with higher limits", async () => {
    const prisma = new PrismaClient();
    prisma.user.findUnique.mockResolvedValue({ plan: "pro" });
    prisma.generation.count.mockResolvedValue(30);

    const req = { user: { id: "user-1" } };
    const next = jest.fn();

    await checkUsageLimit(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.planLimits.model).toBe("gpt-4o");
  });
});
