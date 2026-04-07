/**
 * Request validation middleware using Zod
 * Centralizes schema validation with standardized error responses
 */

const { z } = require("zod");
const { apiResponse } = require("../utils/constants");

/**
 * Create validation middleware from a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate request body against
 * @returns {Function} Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return res.status(400).json(
          apiResponse(false, "Validation failed", null, { errors })
        );
      }
      next(err);
    }
  };
}

module.exports = { validate };
