/**
 * Auth controller unit tests
 * Tests registration, login, and token generation
 *
 * Run: npm test -- tests/auth.test.js
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock dependencies before importing modules
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
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

// Import service after mocking
const { register, login } = require("../src/services/authService");
const { PrismaClient } = require("@prisma/client");

// Test setup
beforeEach(() => {
  jest.clearAllMocks();
  // Ensure JWT_SECRET is set for testing
  process.env.JWT_SECRET = "test-secret-key";
  process.env.JWT_EXPIRES_IN = "1h";
});

describe("Auth Service", () => {
  describe("register", () => {
    it("should create a new user and return JWT token", async () => {
      const mockUser = {
        id: "test-uuid-1",
        name: "Test User",
        email: "test@example.com",
        plan: "free",
        createdAt: new Date(),
      };

      // Mock: user doesn't exist
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await register("Test User", "test@example.com", "password123");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Test User",
          email: "test@example.com",
        }),
        select: expect.any(Object),
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockUser.id }),
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(result).toHaveProperty("token", "mocked-jwt-token");
      expect(result).toHaveProperty("user");
      expect(result.user).not.toHaveProperty("password");
    });

    it("should throw error if email is already registered", async () => {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue({ email: "test@example.com" });

      await expect(
        register("Test User", "test@example.com", "password123")
      ).rejects.toThrow("Email is already registered");

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should hash password with proper salt rounds", async () => {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }) => ({
        id: "test-uuid",
        ...data,
        createdAt: new Date(),
      }));

      const result = await register("Test", "test@example.com", "password123");

      const createdUser = prisma.user.create.mock.calls[0][0].data;
      // Verify password is hashed (not plain text)
      expect(createdUser.password).not.toBe("password123");
      expect(createdUser.password.length).toBeGreaterThan(60); // bcrypt hash length
      expect(createdUser.password.startsWith("$2")).toBe(true);
    });
  });

  describe("login", () => {
    it("should return user and token on successful login", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const mockUser = {
        id: "test-uuid-1",
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        plan: "free",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await login("test@example.com", "password123");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(result).toHaveProperty("token", "mocked-jwt-token");
      expect(result.user).toHaveProperty("email", "test@example.com");
      expect(result.user).not.toHaveProperty("password");
    });

    it("should throw error for non-existent user", async () => {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        login("nouser@test.com", "password123")
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw error for incorrect password", async () => {
      const hashedPassword = await bcrypt.hash("correctpassword", 10);
      const mockUser = {
        id: "test-uuid-1",
        email: "test@example.com",
        password: hashedPassword,
      };

      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        login("test@example.com", "wrongpassword")
      ).rejects.toThrow("Invalid email or password");
    });
  });
});
