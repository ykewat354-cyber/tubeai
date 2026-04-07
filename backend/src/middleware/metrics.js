/**
 * Metrics Middleware — Auto-track every request
 * Records: route, duration, status code
 * Integrates with metrics collector
 */

const metrics = require('../utils/metrics');

function getRouteName(req) {
  // Build a readable route name from method + path
  // e.g. "POST /api/auth/login"
  // Replace UUIDs and IDs in paths for grouping
  let path = req.route ? req.route.path : req.originalUrl;
  // Replace UUIDs and numeric IDs
  path = path.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, ':id');
  path = path.replace(/\/\d+/g, '/:id');

  return `${req.method} ${path}`;
}

function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = getRouteName(req);
    metrics.recordRequest(route, duration, res.statusCode);
  });

  next();
}

module.exports = metricsMiddleware;
