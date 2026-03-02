import supabase from "../config/supabase.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    /* ==============================
       1️⃣ TOTAL GROCERY LISTS
    ============================== */
    const { count: totalLists, error: listError } = await supabase
      .from("grocery_lists")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (listError) throw listError;

    /* ==============================
       2️⃣ TOTAL PANTRY ITEMS
    ============================== */
    const { count: pantryItems, error: pantryError } = await supabase
      .from("pantry")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (pantryError) throw pantryError;

    /* ==============================
       3️⃣ TOTAL SPENDING & SAVINGS
    ============================== */
    const { data: historyData, error: historyError } = await supabase
      .from("shopping_history")
      .select("total_amount, discount_amount")
      .eq("user_id", userId);

    if (historyError) throw historyError;

    let totalSpending = 0;
    let totalSavings = 0;

    historyData?.forEach((record) => {
      totalSpending += Number(record.total_amount || 0);
      totalSavings += Number(record.discount_amount || 0);
    });

    /* ==============================
       4️⃣ GET CURRENT MONTH BUDGET
    ============================== */
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const { data: budgetData, error: budgetError } = await supabase
      .from("budgets")
      .select("amount")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .maybeSingle();

    if (budgetError) throw budgetError;

    const monthlyBudget = Number(budgetData?.amount || 0);
    const remainingBudget = monthlyBudget - totalSpending;

    /* ==============================
       FINAL RESPONSE
    ============================== */
    return res.status(200).json({
      success: true,
      data: {
        totalLists: totalLists ?? 0,
        pantryItems: pantryItems ?? 0,
        totalSpending,
        totalSavings,
        monthlyBudget,
        remainingBudget,
      },
    });

  } catch (error) {
    console.error("Dashboard Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};