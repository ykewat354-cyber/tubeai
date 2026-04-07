/**
 * Analytics routes — track user activity and platform stats
 * Admin endpoints are protected, user analytics require auth
 */

const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { apiResponse } = require("../utils/constants");
const { asyncHandler } = require("../middleware/errorHandler");
const { getUserStats, getPlatformStats } = require("../services/analyticsService");

/**
 * GET /api/analytics/user
 * Returns user's activity stats (requires auth)
 */
router.get("/user", authenticate, asyncHandler(async (req, res) => {
  const period = parseInt(req.query.period, 10) || 30;
  const stats = await getUserStats(req.user.id, { period });
  res.json(apiResponse(true, "OK", stats));
}));

/**
 * GET /api/analytics/platform
 * Returns platform-wide stats (can be made admin-only later)
 */
router.get("/platform", asyncHandler(async (req, res) => {
  const period = parseInt(req.query.period, 10) || 30;
  const stats = await getPlatformStats({ period });
  res.json(apiResponse(true, "OK", stats));
}));

module.exports = router;
