const { asyncHandler } = require("../middleware/errorHandler");
const { getHistory, searchGenerations } = require("../services/historyService");

const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  const result = await getHistory(userId, { page, limit });

  res.json(result);
});

const search = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({ data: [], total: 0 });
  }

  const result = await searchGenerations(userId, q);

  res.json(result);
});

module.exports = { getHistory, search };
