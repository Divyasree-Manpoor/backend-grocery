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
  getSharedList,
  addMissingItems
} from "../controllers/groceryController.js";

const router = express.Router();

/* LISTS */
router.post("/lists", protect, createList);
router.get("/lists", protect, getLists);
router.put("/lists/:id", protect, updateList);
router.delete("/lists/:id", protect, deleteList);

/* ITEMS */
router.post("/items", protect, addItem);
router.get("/items/:listId", protect, getItems);
router.put("/items/:id", protect, updateItem);
router.delete("/items/:id", protect, deleteItem);

/* SHARE */
router.post("/shared/:id", protect, getSharedList);
router.post("/add-items", protect, addMissingItems);

export default router;