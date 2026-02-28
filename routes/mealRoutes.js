import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addMealPlan,
  getMealPlans,
  deleteMealPlan,
  suggestMeals,
} from "../controllers/mealController.js";

const router = express.Router();

/* ===========================
   🍽 MEAL PLAN ROUTES
=========================== */

router.post("/", protect, addMealPlan);

router.get("/plans", protect,getMealPlans);

router.delete("/plans/:id", protect,deleteMealPlan);


/* ===========================
   🥗 MEAL SUGGESTION ROUTE
=========================== */
router.get("/suggestions", protect,suggestMeals);

export default router;