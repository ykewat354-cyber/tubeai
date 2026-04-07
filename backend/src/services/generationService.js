/**
 * Generation service
 * Handles AI content generation via OpenAI and persistence to database.
 *
 * Key responsibilities:
 * - Call OpenAI API with appropriate model (based on user plan)
 * - Save generated content to history
 * - Retrieve and delete specific generations (with ownership verification)
 *
 * @module generationService
 */

const { prisma } = require("../server");
const { generateContent } = require("../config/openai");

/**
 * Generate content using OpenAI and save to user's history
 *
 * @param {string} userId - User UUID
 * @param {string} topic - User's topic/idea description
 * @param {string} format - Output format: "ideas", "titles", "script", or "all"
 * @param {object} planLimits - Plan-specific limits and model selection
 * @param {string} planLimits.model - OpenAI model to use (e.g., "gpt-4o-mini")
 * @returns {Promise<object>} Generated content (without internal fields)
 */
async function createGeneration(userId, topic, format, planLimits) {
  // Call OpenAI API with user's plan-appropriate model
  const result = await generateContent(topic, {
    model: planLimits.model,
    format,
  });

  // Save generation to database for history tracking
  const generation = await prisma.generation.create({
    data: {
      userId,
      topic: topic.trim().substring(0, 500), // Sanitize length
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
 * Retrieve a specific generation by ID
 * Verifies ownership — users can only access their own generations
 *
 * @param {string} userId - User UUID (ownership check)
 * @param {string} generationId - Generation UUID
 * @returns {Promise<object>} Generation record with full result
 * @throws {Error} If generation not found or doesn't belong to user
 */
async function getGenerationById(userId, generationId) {
  const generation = await prisma.generation.findFirst({
    where: {
      id: generationId,
      userId, // Ownership check — prevents IDOR attacks
    },
  });

  if (!generation) {
    throw new Error("Generation not found");
  }

  return generation;
}

/**
 * Delete a generation from user's history
 * Verifies ownership before deletion
 *
 * @param {string} userId - User UUID (ownership check)
 * @param {string} generationId - Generation UUID to delete
 * @returns {Promise<{success: boolean}>}
 * @throws {Error} If generation not found or doesn't belong to user
 */
async function deleteGeneration(userId, generationId) {
  const result = await prisma.generation.deleteMany({
    where: {
      id: generationId,
      userId, // Ownership check — prevents IDOR attacks
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
