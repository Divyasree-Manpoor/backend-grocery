import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { updateFitnessGoal } from "../controllers/userController.js";

const router = express.Router();

/* ==========================
   USER SETTINGS
========================== */

// Update fitness goal
router.put("/fitness-goal", protect, updateFitnessGoal);

export default router;