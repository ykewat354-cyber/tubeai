/**
 * History controller
 * Handles paginated history retrieval and search
 */

const { asyncHandler } = require("../middleware/errorHandler");
const { getHistory, searchGenerations } = require("../services/historyService");
const { apiResponse } = require("../utils/constants");

/**
 * GET /api/history?page=1&limit=20
 */
const getHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await getHistory(req.user.id, { page, limit });

  res.json(apiResponse(true, "OK", result.data, result.pagination));
});

/**
 * GET /api/history/search?q=query
 */
const search = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json(apiResponse(true, "OK", { data: [], total: 0 }));
  }

  const result = await searchGenerations(req.user.id, q);

  res.json(apiResponse(true, "OK", result));
});

module.exports = { getHistory, search };
