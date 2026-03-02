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

    console.log("Incoming Body:", req.body);

    if (!meal_name || !meal_date) {
      return res.status(400).json({
        message: "Meal name and meal date are required",
      });
    }

    /* ---------------------------------
       Try finding meal in meals table
       (SAFE — won't crash if not found)
    ---------------------------------- */
    let meal = null;

    try {
      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .ilike("meal_name", meal_name)
        .maybeSingle();

      if (!error) meal = data;
    } catch (err) {
      console.log("Meals table lookup skipped.");
    }

    /* ---------------------------------
       Insert into meal_plans
    ---------------------------------- */
    const { data: mealPlan, error } = await supabase
      .from("meal_plans")
      .insert([
        {
          user_id: userId,
          meal_name: meal ? meal.meal_name : meal_name,
          meal_date,
          meal_type,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    /* ---------------------------------
       Auto-add ingredients (if meal exists)
    ---------------------------------- */
    if (meal && meal.ingredients?.length > 0) {
      const { data: list } = await supabase
        .from("grocery_lists")
        .select("id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (list) {
        const itemsToInsert = meal.ingredients.map((ingredient) => ({
          list_id: list.id,
          item_name: normalizeString(ingredient),
          quantity: 1,
          unit: "piece",
          price: 0,
        }));

        await supabase.from("grocery_items").insert(itemsToInsert);
      }
    }

    res.status(201).json({
      message: "Meal plan added successfully",
      mealPlan,
    });

  } catch (err) {
    console.error("Add Meal Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ===========================
   📋 GET MEAL PLANS
=========================== */
export const getMealPlans = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId)
      .order("meal_date", { ascending: true });

    if (error) throw error;

    res.status(200).json(data);

  } catch (err) {
    console.error("Get Meal Plans Error:", err);
    res.status(500).json({ error: err.message });
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
        message: "Not authorized to delete this meal plan",
      });
    }

    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({
      message: "Meal plan deleted successfully",
    });

  } catch (err) {
    console.error("Delete Meal Plan Error:", err);
    res.status(500).json({ error: err.message });
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
      .select("dietary_preference")
      .eq("id", userId)
      .maybeSingle();

    const { data: pantryItems } = await supabase
      .from("pantry")
      .select("item_name")
      .eq("user_id", userId);

    if (!pantryItems || pantryItems.length === 0) {
      return res.status(200).json({
        message: "No pantry items found",
        suggestions: [],
      });
    }

    let mealsQuery = supabase.from("meals").select("*");

    if (user?.dietary_preference && user.dietary_preference !== "all") {
      mealsQuery = mealsQuery.eq(
        "dietary_type",
        user.dietary_preference
      );
    }

    const { data: meals } = await mealsQuery;

    const suggestions = matchRecipes(meals || [], pantryItems);

    res.status(200).json({
      message: "Meal suggestions fetched successfully",
      suggestions,
    });

  } catch (err) {
    console.error("Suggest Meals Error:", err);
    res.status(500).json({ error: err.message });
  }
};