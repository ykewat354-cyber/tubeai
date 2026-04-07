/**
 * Auth controller unit tests
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    user: { findUnique: jest.fn(), create: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mocked-jwt-token"),
  verify: jest.fn(),
}));

jest.mock("../src/middleware/errorHandler", () => ({
  asyncHandler: (fn) => fn,
}));

jest.mock("../src/config", () => ({
  auth: { jwtSecret: "test-secret", jwtExpiresIn: "1h", bcryptRounds: 10 },
  server: { frontUrl: "http://localhost:3000" },
  plans: {
    free: { generationsPerDay: 3, model: "gpt-4o-mini" },
    pro: { generationsPerDay: 50, model: "gpt-4o" },
    pro_yearly: { generationsPerDay: 50, model: "gpt-4o" },
  },
}));

const { register, login } = require("../src/services/authService");
const { PrismaClient } = require("@prisma/client");

beforeEach(() => { jest.clearAllMocks(); });

describe("Auth Service", () => {
  describe("register", () => {
    it("should create a new user and return JWT token", async () => {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "test-uuid", name: "Test User", email: "test@example.com",
        plan: "free", createdAt: new Date(),
      });

      const result = await register("Test User", "test@example.com", "password123");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
      expect(result).toHaveProperty("token", "mocked-jwt-token");
      expect(result).toHaveProperty("user");
      expect(result.user).not.toHaveProperty("password");
    });

    it("should throw error if email already registered", async () => {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue({ email: "test@example.com" });

      await expect(register("Test", "test@example.com", "pass"))
        .rejects.toThrow("Email is already registered");
    });

    it("should hash password with bcrypt", async () => {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }) => ({
        id: "test-uuid", ...data, createdAt: new Date(),
      }));

      const result = await register("Test", "test@example.com", "password123");
      const createdData = prisma.user.create.mock.calls[0][0].data;
      expect(createdData.password.startsWith("$2")).toBe(true);
      expect(createdData.password).not.toBe("password123");
    });
  });

  describe("login", () => {
    it("should return user and token on successful login", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue({
        id: "test-uuid", name: "Test", email: "test@example.com",
        password: hashedPassword, plan: "free", createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await login("test@example.com", "password123");

      expect(result).toHaveProperty("token", "mocked-jwt-token");
      expect(result.user).toHaveProperty("email", "test@example.com");
      expect(result.user).not.toHaveProperty("password");
    });

    it("should throw error for incorrect credentials", async () => {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(login("nouser@test.com", "pass")).rejects.toThrow("Invalid email or password");
    });
  });
});
