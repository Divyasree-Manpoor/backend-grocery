import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getShoppingHistory, getBillById } from "../controllers/shoppingController.js";

const router = express.Router();

/* ===========================
   📜 SHOPPING HISTORY ROUTES
=========================== */

// Get all shopping history
router.get("/", protect, getShoppingHistory);

// Get single bill details
router.get("/:id", protect, getBillById);

export default router;