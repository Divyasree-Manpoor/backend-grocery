import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getShoppingHistory } from "../controllers/shoppingController.js";

const router = express.Router();

/* ===========================
   📜 SHOPPING HISTORY ROUTES
=========================== */

// Get all shopping history for logged-in user
router.get("/", protect, getShoppingHistory);

export default router;