import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addMealPlan,
  getMealPlans,
  deleteMealPlan,
  suggestMeals,
  updateMealPlan
} from "../controllers/mealController.js";

const router = express.Router();

/* ===========================
   🍽 MEAL PLAN ROUTES
=========================== */

// Create meal plan
router.post("/plans", protect, addMealPlan);

// Get all meal plans
router.get("/plans", protect, getMealPlans);

// Delete meal plan
router.delete("/plans/:id", protect, deleteMealPlan);

/* ===========================
   🥗 MEAL SUGGESTIONS
=========================== */

// Suggest meals based on pantry + dietary preference
router.get("/suggestions", protect, suggestMeals);


router.put("/:id", updateMealPlan);


export default router;