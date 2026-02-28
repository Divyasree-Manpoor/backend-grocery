import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createList,
  getLists,
  updateList,
  deleteList,
  addItem,
  getItems,
  updateItem,
  deleteItem,
  getBudgetSummary,
  completeShopping,
  getShoppingHistory,
  getCouponsForList,
  shareList
} from "../controllers/groceryController.js";
import { addPantryItem, getPantryItems } from "../controllers/groceryController.js";
const router = express.Router();

/* ===========================
   🛒 GROCERY LIST ROUTES
=========================== */

router.post("/list",protect, createList);

router.get("/lists", protect,getLists);

router.put("/list/:id", protect,updateList);

router.delete("/list/:id",protect, deleteList);

router.get("/budget", protect, getBudgetSummary);

router.post("/complete", protect, completeShopping);

router.get("/history", protect, getShoppingHistory);

router.get("/coupons/:listId", protect, getCouponsForList);
/* ===========================
   🛍 GROCERY ITEM ROUTES
=========================== */

router.post("/item", protect,addItem);

router.get("/items/:listId",protect, getItems);

router.put("/item/:id",protect, updateItem);

router.delete("/item/:id", protect,deleteItem);
router.post("/pantry", protect, addPantryItem);
router.get("/pantry", protect, getPantryItems);

router.post("/share", protect, shareList);
router.delete("/list/:id",protect, deleteList);
router.get("/items/:listId", getItems);

export default router;
