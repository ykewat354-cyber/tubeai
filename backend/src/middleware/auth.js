/**
 * Authentication middleware
 * Verifies JWT tokens and attaches user to request
 */

const jwt = require("jsonwebtoken");
const config = require("../config");

/**
 * Authenticate middleware — verifies JWT and attaches user to req.user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.auth.jwtSecret);

    req.user = decoded; // { id, email, name }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expired. Please login again." });
    }
    return res.status(401).json({ success: false, error: "Invalid token." });
  }
}

/**
 * Optional auth — attaches user if valid token present, but doesn't block
 * Useful for endpoints that work with or without auth
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, config.auth.jwtSecret);
      req.user = decoded;
    }
    next();
  } catch {
    next();
  }
}

module.exports = { authenticate, optionalAuth };
