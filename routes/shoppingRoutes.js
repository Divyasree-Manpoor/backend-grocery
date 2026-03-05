import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  completeShopping,
  getShoppingHistory,
  getLatestShopping,
  getBillByList,
  getLatestBill
} from "../controllers/shoppingController.js";

const router = express.Router();

/* ===========================
   🛒 SHOPPING ROUTES
=========================== */

// Complete shopping (save history)
router.post("/complete", protect, completeShopping);

// Get shopping history
router.get("/history", protect, getShoppingHistory);

router.get("/latest", protect, getLatestShopping);

router.get("/bill/:listId", protect, getBillByList);

router.get("/latest-bill", protect, getLatestBill);

export default router;