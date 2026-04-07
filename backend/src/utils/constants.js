/**
 * Application constants
 *
 * Reusable values that don't change at runtime.
 * Centralizing these prevents magic numbers/strings scattered across codebase.
 */

/** HTTP status codes with descriptions */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/** Standard API response factory */
function apiResponse(success, message, data = null, meta = null) {
  const response = {
    success,
    message,
  };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return response;
}

/** Pagination defaults */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

/** Input validation limits */
const INPUT_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 50,
  EMAIL_MAX: 100,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  TOPIC_MIN: 3,
  TOPIC_MAX: 500,
};

/** CORS allowed HTTP methods */
const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE"];

/** CORS allowed headers */
const ALLOWED_HEADERS = ["Content-Type", "Authorization"];

module.exports = {
  HTTP_STATUS,
  apiResponse,
  PAGINATION,
  INPUT_LIMITS,
  ALLOWED_METHODS,
  ALLOWED_HEADERS,
};
