/**
 * Generation service unit tests
 * Tests content generation, history retrieval, and deletion
 *
 * Run: npm test -- tests/generation.test.js
 */

// Mock dependencies
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    generation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock("../src/config/openai", () => ({
  generateContent: jest.fn(() => ({
    ideas: ["Idea 1", "Idea 2"],
    titles: ["Title 1", "Title 2"],
    script: "Sample script content",
  })),
}));

const { createGeneration, getGenerationById, deleteGeneration } =
  require("../src/services/generationService");
const { PrismaClient } = require("@prisma/client");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Generation Service", () => {
  describe("createGeneration", () => {
    it("should generate content and save to database", async () => {
      const mockCreation = {
        id: "gen-uuid-1",
        userId: "user-uuid-1",
        topic: "React tutorial",
        format: "all",
        result: {
          ideas: ["Idea 1", "Idea 2"],
          titles: ["Title 1", "Title 2"],
          script: "Sample script content",
        },
        model: "gpt-4o-mini",
        createdAt: new Date(),
      };

      const prisma = new PrismaClient();
      prisma.generation.create.mockResolvedValue(mockCreation);

      const planLimits = {
        model: "gpt-4o-mini",
        generationsPerDay: 3,
      };

      const result = await createGeneration(
        "user-uuid-1",
        "React tutorial",
        "all",
        planLimits
      );

      expect(result).toHaveProperty("id", "gen-uuid-1");
      expect(result).toHaveProperty("topic", "React tutorial");
      expect(result).toHaveProperty("result");
      expect(result).not.toHaveProperty("userId"); // sanitized for API response
    });

    it("should use the model specified in planLimits", async () => {
      const prisma = new PrismaClient();
      prisma.generation.create.mockResolvedValue({
        id: "gen-uuid",
        userId: "user-1",
        topic: "test",
        format: "all",
        result: {},
        model: "gpt-4o",
        createdAt: new Date(),
      });

      await createGeneration("user-1", "test", "all", {
        model: "gpt-4o",
        generationsPerDay: 50,
      });

      expect(prisma.generation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          model: "gpt-4o",
        }),
      });
    });
  });

  describe("getGenerationById", () => {
    it("should return generation if it belongs to user", async () => {
      const mockGeneration = {
        id: "gen-uuid-1",
        userId: "user-uuid-1",
        topic: "React tutorial",
        format: "all",
        result: {},
        model: "gpt-4o-mini",
        createdAt: new Date(),
      };

      const prisma = new PrismaClient();
      prisma.generation.findFirst.mockResolvedValue(mockGeneration);

      const result = await getGenerationById("user-uuid-1", "gen-uuid-1");

      expect(result).toEqual(mockGeneration);
      expect(prisma.generation.findFirst).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: "gen-uuid-1",
          userId: "user-uuid-1",
        }),
      });
    });

    it("should throw error if generation not found", async () => {
      const prisma = new PrismaClient();
      prisma.generation.findFirst.mockResolvedValue(null);

      await expect(
        getGenerationById("user-1", "non-existent-id")
      ).rejects.toThrow("Generation not found");
    });
  });

  describe("deleteGeneration", () => {
    it("should delete generation belonging to user", async () => {
      const prisma = new PrismaClient();
      prisma.generation.deleteMany.mockResolvedValue({ count: 1 });

      const result = await deleteGeneration("user-1", "gen-1");

      expect(result).toEqual({ success: true });
      expect(prisma.generation.deleteMany).toHaveBeenCalledWith({
        where: { id: "gen-1", userId: "user-1" },
      });
    });

    it("should throw error if generation does not belong to user", async () => {
      const prisma = new PrismaClient();
      prisma.generation.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        deleteGeneration("user-1", "gen-bad")
      ).rejects.toThrow("Generation not found");
    });
  });
});
