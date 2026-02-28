import express from "express";
import { saveMonthlyBudget, getCurrentMonthBudget } from "../controllers/budgetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, saveMonthlyBudget);
router.get("/current", protect, getCurrentMonthBudget);

export default router;