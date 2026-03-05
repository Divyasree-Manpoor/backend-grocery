import supabase from "../config/supabase.js";
import { matchRecipes } from "../utils/recipeMatcher.js";
import { normalizeString } from "../utils/formatHelper.js";

/* ===========================
➕ ADD MEAL PLAN
=========================== */

export const addMealPlan = async (req, res) => {

try {

const userId = req.user.id;
const { meal_name, meal_date, meal_type } = req.body;

if (!meal_name || !meal_date) {
  return res.status(400).json({
    message: "Meal name and meal date are required"
  });
}

/* ---------------------------------
   FIND MEAL IN MEALS TABLE
---------------------------------- */

let meal = null;

try {

  const normalizedInput = normalizeString(meal_name);

  const { data: meals } = await supabase
    .from("meals")
    .select("*");

  meal = meals?.find(m =>
    normalizeString(m.meal_name).includes(normalizedInput) ||
    normalizedInput.includes(normalizeString(m.meal_name))
  );

} catch (err) {

  console.log("Meal lookup skipped");

}

/* ---------------------------------
   INSERT INTO MEAL PLANS
---------------------------------- */

const { data: mealPlan, error } = await supabase
  .from("meal_plans")
  .insert([
    {
      user_id: userId,
      meal_id: meal?.id || null,
      meal_name: meal ? meal.meal_name : meal_name,
      meal_date,
      meal_type
    }
  ])
  .select()
  .single();

if (error) throw error;

/* ---------------------------------
   CHECK MISSING INGREDIENTS
---------------------------------- */

let missingIngredients = [];

if (meal && meal.ingredients?.length > 0) {

  const { data: pantry } = await supabase
    .from("pantry")
    .select("item_name")
    .eq("user_id", userId);

  const pantryItems = pantry.map(p =>
    p.item_name.toLowerCase()
  );

  missingIngredients = meal.ingredients.filter(
    ingredient =>
      !pantryItems.includes(ingredient.toLowerCase())
  );

}

/* ---------------------------------
   SAVE MISSING INGREDIENTS
---------------------------------- */

if (missingIngredients.length > 0) {

  await supabase
    .from("meal_plans")
    .update({
      missing_ingredients: missingIngredients
    })
    .eq("id", mealPlan.id);

}

/* ---------------------------------
   GET GROCERY LISTS
---------------------------------- */

const { data: lists } = await supabase
  .from("grocery_lists")
  .select("id, title")
  .eq("user_id", userId);

res.status(201).json({
  message: "Meal plan added successfully",
  mealPlan: {
    ...mealPlan,
    missing_ingredients: missingIngredients
  },
  lists
});

} catch (err) {

console.error("Add Meal Error:", err);

res.status(500).json({
  error: err.message
});

}

};

/* ===========================
📋 GET MEAL PLANS
=========================== */

export const getMealPlans = async (req, res) => {

try {

const userId = req.user.id;

const { data: plans } = await supabase
  .from("meal_plans")
  .select("*")
  .eq("user_id", userId)
  .order("meal_date", { ascending: true });

const { data: meals } = await supabase
  .from("meals")
  .select("*");

const enrichedPlans = plans.map(plan => {

  const mealInfo = meals.find(
    m =>
      normalizeString(m.meal_name) ===
      normalizeString(plan.meal_name)
  );

  return {
    ...plan,
    calories: mealInfo?.calories || 0,
    protein: mealInfo?.protein || 0,
    carbs: mealInfo?.carbs || 0,
    fat: mealInfo?.fat || 0
  };

});

res.status(200).json(enrichedPlans);

} catch (err) {

console.error("Get Meal Plans Error:", err);

res.status(500).json({
  error: err.message
});

}

};

/* ===========================
✏️ UPDATE MEAL PLAN
=========================== */

export const updateMealPlan = async (req, res) => {

try {

const { id } = req.params;
const { meal_name } = req.body;

const { data, error } = await supabase
  .from("meal_plans")
  .update({ meal_name })
  .eq("id", id)
  .select()
  .single();

if (error) throw error;

res.status(200).json({
  message: "Meal updated successfully",
  data
});

} catch (err) {

console.error("Update Meal Error:", err);

res.status(500).json({
  error: err.message
});

}

};

/* ===========================
🗑 DELETE MEAL PLAN
=========================== */

export const deleteMealPlan = async (req, res) => {

try {

const { id } = req.params;
const userId = req.user.id;

const { data: mealPlan } = await supabase
  .from("meal_plans")
  .select("*")
  .eq("id", id)
  .maybeSingle();

if (!mealPlan || mealPlan.user_id !== userId) {

  return res.status(403).json({
    message: "Not authorized to delete this meal plan"
  });

}

await supabase
  .from("meal_plans")
  .delete()
  .eq("id", id);

res.status(200).json({
  message: "Meal plan deleted successfully"
});

} catch (err) {

console.error("Delete Meal Plan Error:", err);

res.status(500).json({
  error: err.message
});

}

};

/* ===========================
🥗 MEAL SUGGESTIONS
=========================== */

export const suggestMeals = async (req, res) => {

try {

const userId = req.user.id;

const { data: user } = await supabase
  .from("users")
  .select("dietary_preference, fitness_goal")
  .eq("id", userId)
  .maybeSingle();

const { data: pantryItems } = await supabase
  .from("pantry")
  .select("item_name")
  .eq("user_id", userId);

if (!pantryItems || pantryItems.length === 0) {

  return res.status(200).json({
    message: "No pantry items found",
    suggestions: []
  });

}

let mealsQuery = supabase
  .from("meals")
  .select("*");

if (user?.dietary_preference && user.dietary_preference !== "all") {

  mealsQuery = mealsQuery.eq(
    "dietary_type",
    user.dietary_preference
  );

}

if (user?.fitness_goal === "weight_loss") {

  mealsQuery = mealsQuery.lte("calories", 300);

}

if (user?.fitness_goal === "muscle_gain") {

  mealsQuery = mealsQuery.gte("protein", 20);

}

const { data: meals } = await mealsQuery;

const suggestions = matchRecipes(meals || [], pantryItems);

res.status(200).json({
  message: "Meal suggestions fetched successfully",
  suggestions
});

} catch (err) {

console.error("Suggest Meals Error:", err);

res.status(500).json({
  error: err.message
});


}

};
