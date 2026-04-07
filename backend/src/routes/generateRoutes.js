const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { checkUsageLimit } = require("../middleware/subscription");
const { generateLimiter } = require("../middleware/rateLimiter");
const { validate } = require("../middleware/validate");
const { z } = require("zod");
const generateController = require("../controllers/generateController");

const generateSchema = z.object({
  topic: z.string().min(3).max(500),
  format: z.enum(["ideas", "titles", "script", "all"]).optional().default("all"),
});

const detailSchema = z.object({
  id: z.string().uuid(),
});

// All routes require auth + usage limit check
router.use(authenticate, checkUsageLimit);

router.post("/", generateLimiter, validate(generateSchema), generateController.generate);
router.get("/:id", validate(detailSchema), generateController.getDetail);
router.delete("/:id", validate(detailSchema), generateController.deleteGeneration);

module.exports = router;
