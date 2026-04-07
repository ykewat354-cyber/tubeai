/**
 * Generation service
 * Manages AI content generation and history persistence
 */

const { prisma } = require("../server");
const { generateContent } = require("../config/openai");

/**
 * Generate content using OpenAI and save to history
 * @param {string} userId
 * @param {string} topic
 * @param {string} format
 * @param {object} planLimits
 * @returns {Promise<object>}
 */
async function createGeneration(userId, topic, format, planLimits) {
  const result = await generateContent(topic, {
    model: planLimits.model,
    format,
  });

  const generation = await prisma.generation.create({
    data: {
      userId,
      topic: topic.trim().substring(0, 500),
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
 * Get generation by ID with ownership verification
 * @param {string} userId
 * @param {string} generationId
 * @returns {Promise<object>}
 */
async function getGenerationById(userId, generationId) {
  const generation = await prisma.generation.findFirst({
    where: { id: generationId, userId },
  });

  if (!generation) throw new Error("Generation not found");
  return generation;
}

/**
 * Delete generation with ownership verification
 * @param {string} userId
 * @param {string} generationId
 * @returns {Promise<{success: boolean}>}
 */
async function deleteGeneration(userId, generationId) {
  const result = await prisma.generation.deleteMany({
    where: { id: generationId, userId },
  });

  if (result.count === 0) throw new Error("Generation not found");
  return { success: true };
}

module.exports = { createGeneration, getGenerationById, deleteGeneration };
