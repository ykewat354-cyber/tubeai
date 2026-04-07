const { z } = require("zod");

/**
 * Middleware factory: validates request body against a Zod schema
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
        return res.status(400).json({ error: "Validation failed", details: errors });
      }
      next(err);
    }
  };
}

module.exports = { validate };
