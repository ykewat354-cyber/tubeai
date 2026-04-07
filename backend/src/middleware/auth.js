/**
 * Authentication Middleware
 * Verifies JWT tokens with enhanced security
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.auth.jwtSecret, {
      algorithms: ['HS256'], // Only allow HS256
      clockTolerance: 15,    // Allow 15s clock drift
    });

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    logger.warn({ message: 'Auth failed', ip: req.ip, error: err.message });
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
}

function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.auth.jwtSecret, { algorithms: ['HS256'] });
      req.user = decoded;
    }
    next();
  } catch { next(); }
}

module.exports = { authenticate, optionalAuth };
