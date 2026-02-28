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

router.post("/", protect,addPantryItem);

router.get("/",protect, getPantryItems);

router.put("/:id",protect, updatePantryItem);

router.delete("/:id",protect, deletePantryItem);

router.post("/pantry", protect, addPantryItem);
router.get("/pantry", protect, getPantryItems);

export default router;