/**
 * Generation controller — AI content generation and individual generation management
 */

const { asyncHandler } = require("../middleware/errorHandler");
const { createGeneration, getGenerationById, deleteGeneration } = require("../services/generationService");
const { track } = require("../services/analyticsService");
const { apiResponse } = require("../utils/constants");

/** POST /api/generate */
const generate = asyncHandler(async (req, res) => {
  const { topic, format } = req.body;
  const planLimits = req.planLimits;

  const result = await createGeneration(req.user.id, topic, format, planLimits);

  // Track: user generated content (includes plan and model for analytics)
  track("content_generated", req.user.id, {
    format,
    model: planLimits.model,
    plan: req.planName,
    ip: req.ip,
  }).catch(() => {});

  res.status(201).json(
    apiResponse(true, "Content generated successfully", result, { usage: req.usage })
  );
});

/** GET /api/generate/:id */
const getDetail = asyncHandler(async (req, res) => {
  const result = await getGenerationById(req.user.id, req.params.id);
  res.json(apiResponse(true, "OK", { generation: result }));
});

/** DELETE /api/generate/:id */
const deleteCtrl = asyncHandler(async (req, res) => {
  await deleteGeneration(req.user.id, req.params.id);

  // Track: user deleted content
  track("history_deleted", req.user.id, { generationId: req.params.id }).catch(() => {});

  res.json(apiResponse(true, "Generation deleted successfully"));
});

module.exports = { generate, getDetail, delete: deleteCtrl };
