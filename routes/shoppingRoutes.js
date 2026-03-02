import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  completeShopping,
  getShoppingHistory,
} from "../controllers/shoppingController.js";

const router = express.Router();

/* ===========================
   🛒 SHOPPING ROUTES
=========================== */

// Complete shopping (save history)
router.post("/complete", protect, completeShopping);

// Get shopping history
router.get("/history", protect, getShoppingHistory);

export default router;