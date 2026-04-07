/**
 * Lightweight structured logger
 * No external dependencies — uses console with formatted output
 *
 * Output format:
 * [LEVEL] [TIMESTAMP] [MODULE] Message — Context
 *
 * In development: colorized output
 * In production: JSON lines (machine-readable for log aggregation)
 */

const LEVELS = {
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
  debug: "DEBUG",
};

function formatTimestamp() {
  return new Date().toISOString().replace("T", " ").split(".")[0];
}

/**
 * Log a message with optional context object
 * @param {string} level - One of: info, warn, error, debug
 * @param {object} data - { message, ...context }
 */
function log(level, data) {
  const timestamp = formatTimestamp();
  const { message, ...context } = data;

  if (process.env.NODE_ENV === "production") {
    // Production: JSON line for log aggregation (Datadog, CloudWatch, etc.)
    const entry = {
      level,
      timestamp,
      message,
      ...(Object.keys(context).length > 0 && { context }),
    };
    console.log(JSON.stringify(entry));
  } else {
    // Development: human-readable colored output
    const contextStr = Object.keys(context).length > 0
      ? "—" + JSON.stringify(context, null, 2)
      : "";
    console.log(`[${LEVELS[level]}] [${timestamp}] ${message} ${contextStr}`.trim());
  }

  // Always write errors to stderr
  if (level === "error") {
    console.error(JSON.stringify({ level, timestamp, message, ...context }));
  }
}

module.exports = {
  info: (data) => log("info", data),
  warn: (data) => log("warn", data),
  error: (data) => log("error", data),
  debug: (data) => {
    if (process.env.NODE_ENV === "development") {
      log("debug", data);
    }
  },
};
