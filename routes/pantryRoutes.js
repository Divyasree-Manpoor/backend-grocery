import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addPantryItem,
  getPantryItems,
  updatePantryItem,
  deletePantryItem,
} from "../controllers/pantryController.js";

const router = express.Router();

/* ===========================
   🥫 PANTRY ROUTES
=========================== */

// Add pantry item
router.post("/", protect, addPantryItem);

// Get all pantry items
router.get("/", protect, getPantryItems);

// Update pantry item
router.put("/:id", protect, updatePantryItem);

// Delete pantry item
router.delete("/:id", protect, deletePantryItem);

export default router;