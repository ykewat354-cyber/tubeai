/**
 * Advanced Logging System (Winston)
 *
 * Features:
 * - File logging: combined.log, error.log
 * - Console: colorized in dev, JSON in prod
 * - Log rotation: 14-day retention, 20MB max per file
 * - Uncaught exception + unhandled rejection handling
 * - HTTP request logging middleware
 *
 * Log files: backend/logs/
 *
 * Usage:
 *   const logger = require("../utils/logger");
 *   logger.info({ message: "User logged in", userId: "123" });
 */

const winston = require("winston");
const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "../../logs");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...rest }) => {
    const restStr = Object.keys(rest).length > 0 ? " " + JSON.stringify(rest) : "";
    return `[${timestamp}] ${level}: ${message}${restStr}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  defaultMeta: { service: "tubeai-backend" },
  transports: [
    // Combined log (all levels)
    new winston.transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
      format: fileFormat,
      maxsize: 20 * 1024 * 1024,
      maxFiles: 14,
    }),
    // Error-only log
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      format: fileFormat,
      level: "error",
      maxsize: 20 * 1024 * 1024,
      maxFiles: 30,
    }),
    // Console
    new winston.transports.Console({
      format: process.env.NODE_ENV === "production" ? fileFormat : consoleFormat,
    }),
  ],
});

logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(LOG_DIR, "exceptions.log"),
    format: fileFormat,
    maxsize: 20 * 1024 * 1024,
  })
);

logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(LOG_DIR, "rejections.log"),
    format: fileFormat,
    maxsize: 20 * 1024 * 1024,
  })
);

/**
 * HTTP request logging middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400 || duration > 100) {
      logger.warn({ message: "HTTP", method: req.method, path: req.originalUrl, status: res.statusCode, ms: duration });
    } else {
      logger.debug({ message: "HTTP", method: req.method, path: req.originalUrl, status: res.statusCode, ms: duration });
    }
  });
  next();
}

module.exports = logger;
module.exports.requestLogger = requestLogger;
