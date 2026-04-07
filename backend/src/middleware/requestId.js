/**
 * Request ID Middleware
 * Adds unique X-Request-Id to every request for log correlation and tracing
 */

const crypto = require('crypto');

function requestIdMiddleware(req, res, next) {
  req.id = req.headers['x-request-id'] || `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
  res.setHeader('X-Request-Id', req.id);
  next();
}

module.exports = requestIdMiddleware;
