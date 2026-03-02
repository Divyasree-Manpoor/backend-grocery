import express from "express";
import {
  saveMonthlyBudget,
  getCurrentMonthBudget,
} from "../controllers/budgetController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequiredFields } from "../middleware/validateMiddleware.js";

const router = express.Router();

/* ===========================
   💰 BUDGET ROUTES
=========================== */

// Save or Update Current Month Budget
router.post(
  "/",
  protect,
  validateRequiredFields(["amount"]),
  saveMonthlyBudget
);

// Get Current Month Budget
router.get(
  "/current",
  protect,
  getCurrentMonthBudget
);

export default router;