const { asyncHandler } = require("../middleware/errorHandler");
const { createGeneration, getGenerationById, deleteGeneration } = require("../services/generationService");

const generate = asyncHandler(async (req, res) => {
  const { topic, format } = req.body;
  const userId = req.user.id;
  const planLimits = req.planLimits;

  const result = await createGeneration(userId, topic, format, planLimits);

  res.status(201).json({
    message: "Content generated successfully",
    data: result,
    usage: req.usage,
  });
});

const getDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await getGenerationById(userId, id);

  res.json({ data: result });
});

const deleteGeneration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  await deleteGeneration(userId, id);

  res.json({ message: "Generation deleted successfully" });
});

module.exports = { generate, getDetail, deleteGeneration };
