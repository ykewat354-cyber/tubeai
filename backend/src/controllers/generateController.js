/**
 * Generation controller
 * Handles AI content generation and individual generation management
 */

const { asyncHandler } = require("../middleware/errorHandler");
const { createGeneration, getGenerationById, deleteGeneration } = require("../services/generationService");
const { apiResponse } = require("../utils/constants");

/**
 * POST /api/generate
 * Generates content using AI and saves to history
 * Requires: auth + usage limit check + rate limiting
 */
const generate = asyncHandler(async (req, res) => {
  const { topic, format } = req.body;
  const planLimits = req.planLimits;

  const result = await createGeneration(req.user.id, topic, format, planLimits);

  res.status(201).json(
    apiResponse(true, "Content generated successfully", result, {
      usage: req.usage,
    })
  );
});

/**
 * GET /api/generate/:id
 * Get a specific generation by ID (ownership verified)
 */
const getDetail = asyncHandler(async (req, res) => {
  const result = await getGenerationById(req.user.id, req.params.id);

  res.json(apiResponse(true, "OK", { generation: result }));
});

/**
 * DELETE /api/generate/:id
 * Delete a generation from history (ownership verified)
 */
const deleteGeneration = asyncHandler(async (req, res) => {
  await deleteGeneration(req.user.id, req.params.id);

  res.json(apiResponse(true, "Generation deleted successfully"));
});

module.exports = { generate, getDetail, deleteGeneration };
