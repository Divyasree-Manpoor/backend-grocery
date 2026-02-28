import supabase from "../config/supabase.js";

/* ===========================
   🍽️ MEAL PLAN CONTROLLERS
=========================== */

// Add Meal Plan (User selects meal for a date)
export const addMealPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { meal_name, meal_date } = req.body;

    if (!meal_name || !meal_date) {
      return res.status(400).json({
        message: "Meal name and meal date are required",
      });
    }
    // 1️⃣ Save meal plan
    const { data: mealPlan ,error } = await supabase
      .from("meal_plans")
      .insert([{ user_id: userId, meal_name, meal_date }])
      .select()
      .single();
     
      if (error) throw error;

    // 2️⃣ Get meal ingredients
    const { data: meal } = await supabase
      .from("meals")
      .select("ingredients")
      .eq("meal_name", meal_name)
      .single();

    if (meal && meal.ingredients) {
      // 3️⃣ Get user's first grocery list
      const { data: list } = await supabase
        .from("grocery_lists")
        .select("id")
        .eq("user_id", userId)
        .limit(1)
        .single();

      if (list) {
        const itemsToInsert = meal.ingredients.map((item) => ({
          list_id: list.id,
          item_name: item,
          quantity: 1,
        }));
        await supabase.from("grocery_items").insert(itemsToInsert);
      }
    }

    res.status(201).json({
      message: "Meal plan added successfully and ingredients added to grocery list",
      mealPlan,//mealsplan
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Meal Plans by User
export const getMealPlans = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




// Delete Meal Plan
export const deleteMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: mealPlan, error: fetchError } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    if (!mealPlan || mealPlan.user_id !== userId) {
      return res.status(403).json({
        message: "Not authorized to delete this meal plan",
      });
    }
    const { error } = await supabase.from("meal_plans").delete().eq("id", id);

    if (error) throw error;

    res.status(200).json({
      message: "Meal plan deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===========================
   🥗 MEAL SUGGESTION LOGIC
=========================== */

export const suggestMeals = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's dietary preference
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("dietary_preference")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // 1️⃣ Get Pantry Items of User
    const { data: pantryItems, error: pantryError } = await supabase
      .from("pantry")
      .select("item_name")
      .eq("user_id", userId);

    if (pantryError) throw pantryError;

    if (!pantryItems || pantryItems.length === 0) {
      return res.status(200).json({
        message: "No pantry items found",
        suggestions: [],
      });
    }

    // Convert pantry items to lowercase array
    const pantryList = pantryItems.map((item) => item.item_name.toLowerCase());

    let mealsQuery = supabase.from("meals").select("*");

    if (user.dietary_preference !== "all") {
      mealsQuery = mealsQuery.eq("dietary_type", user.dietary_preference);
    }

    // 2️⃣ Get All Meals
    const { data: meals, error: mealsError } = await mealsQuery;

    if (mealsError) throw mealsError;

    // 3️⃣ Compare Ingredients
    const suggestions = meals.filter((meal) => {
      const ingredients = meal.ingredients.map((ing) => ing.toLowerCase());

      // Check if every ingredient exists in pantry
      return ingredients.every((ingredient) => pantryList.includes(ingredient));
    });

    res.status(200).json({
      message: "Meal suggestions fetched successfully",
      suggestions,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
