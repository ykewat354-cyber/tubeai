const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { z } = require("zod");
const historyController = require("../controllers/historyController");

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
});

// All routes require auth
router.use(authenticate);

router.get("/", validate(paginationSchema), historyController.getHistory);
router.get("/search", validate(paginationSchema), historyController.search);

module.exports = router;
