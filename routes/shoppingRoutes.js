import express from "express";
import {
  completeShopping,
  getShoppingHistory,
} from "../controllers/shoppingController.js";

const router = express.Router();

router.post("/complete-shopping", completeShopping);
router.get("/history", getShoppingHistory);//changed

export default router;