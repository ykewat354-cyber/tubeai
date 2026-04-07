/**
 * Advanced Logger (Winston) — Structured, Rotating, Multi-Transport
 *
 * Features:
 * - structured JSON logging (machine-readable for log aggregation)
 * - file rotation: combined.log (all), error.log (errors only)
 * - HTTP access logging with request duration
 * - uncaught exception / unhandled rejection handling
 * - request ID correlation (via requestId middleware)
 * - graceful log rotation (max 20MB, 14-day retention)
 *
 * Usage:
 *   const logger = require("./utils/logger");
 *   logger.info({ message: "User logged in", userId: "abc123" });
 */

const winston = require('winston');
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const fileFmt = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFmt = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, requestId, ...rest }) => {
    const tag = requestId || '';
    const data = Object.keys(rest).length ? ' ' + JSON.stringify(rest) : '';
    return `[${timestamp}] ${level}${tag ? ` [${tag}]` : ''}: ${message}${data}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  defaultMeta: { service: 'tubeai-backend' },
  transports: [
    new winston.transports.File({ filename: path.join(LOG_DIR, 'combined.log'), format: fileFmt, maxsize: 20 * 1024 * 1024, maxFiles: 14 }),
    new winston.transports.File({ filename: path.join(LOG_DIR, 'error.log'), format: fileFmt, level: 'error', maxsize: 20 * 1024 * 1024, maxFiles: 30 }),
    new winston.transports.Console({ format: process.env.NODE_ENV === 'production' ? fileFmt : consoleFmt }),
  ],
});

logger.exceptions.handle(
  new winston.transports.File({ filename: path.join(LOG_DIR, 'exceptions.log'), format: fileFmt, maxsize: 20 * 1024 * 1024 })
);

logger.rejections.handle(
  new winston.transports.File({ filename: path.join(LOG_DIR, 'rejections.log'), format: fileFmt, maxsize: 20 * 1024 * 1024 })
);

/**
 * HTTP request logger middleware
 * Logs method, path, status, duration, IP, and requestId.
 * Errors and slow requests (>100ms) logged at warn level.
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const dur = Date.now() - start;
    const level = res.statusCode >= 400 || dur > 100 ? 'warn' : 'debug';
    logger.log(level, 'HTTP', {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${dur}ms`,
      ip: req.ip,
    });
  });
  next();
}

/**
 * Create a child logger with default fields (e.g., requestId)
 */
function childLogger(defaults) {
  return logger.child(defaults);
}

module.exports = logger;
module.exports.requestLogger = requestLogger;
module.exports.childLogger = childLogger;
