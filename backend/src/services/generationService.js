const { prisma } = require("../server");
const { generateContent } = require("../config/openai");

/**
 * Generate content and save to history
 */
async function createGeneration(userId, topic, format, planLimits) {
  // Generate using OpenAI
  const result = await generateContent(topic, {
    model: planLimits.model,
    format,
  });

  // Save to database
  const generation = await prisma.generation.create({
    data: {
      userId,
      topic,
      format,
      result,
      model: planLimits.model,
    },
  });

  return {
    id: generation.id,
    topic: generation.topic,
    format: generation.format,
    result: generation.result,
    createdAt: generation.createdAt,
  };
}

/**
 * Get generation by ID
 */
async function getGenerationById(userId, generationId) {
  const generation = await prisma.generation.findFirst({
    where: {
      id: generationId,
      userId,
    },
  });

  if (!generation) {
    throw new Error("Generation not found");
  }

  return generation;
}

/**
 * Delete a generation
 */
async function deleteGeneration(userId, generationId) {
  const result = await prisma.generation.deleteMany({
    where: {
      id: generationId,
      userId,
    },
  });

  if (result.count === 0) {
    throw new Error("Generation not found");
  }

  return { success: true };
}

module.exports = {
  createGeneration,
  getGenerationById,
  deleteGeneration,
};
