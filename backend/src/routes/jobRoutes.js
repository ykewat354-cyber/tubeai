/**
 * Job Status Routes
 * Check queue job status — used by frontend polling
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getJobStatus, getQueueStats } = require('../config/queue');
const { asyncHandler } = require('../middleware/errorHandler');
const { apiResponse } = require('../utils/constants');

/**
 * GET /api/jobs/:id — Check status of a queued job
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const status = await getJobStatus(req.params.id);
  res.json(apiResponse(status.status !== 'not-found', 'OK', status));
}));

/**
 * GET /api/jobs/stats — Queue statistics (admin or dev)
 */
router.get('/stats', asyncHandler(async (_req, res) => {
  const stats = await getQueueStats();
  res.json(apiResponse(true, 'OK', stats));
}));

module.exports = router;
