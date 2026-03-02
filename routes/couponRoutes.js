import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getCouponsForList } from "../controllers/couponController.js";

const router = express.Router();

router.get("/:listId", protect, getCouponsForList);

export default router;