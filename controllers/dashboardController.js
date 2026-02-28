import supabase from "../config/supabase.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    /* ==============================
       1️⃣ TOTAL LISTS
    ============================== */
    const { count: totalLists } = await supabase
      .from("grocery_lists")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    /* ==============================
       2️⃣ TOTAL PANTRY ITEMS
    ============================== */
    const { count: pantryItems } = await supabase
      .from("pantry")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    /* ==============================
       3️⃣ TOTAL SPENDING FROM HISTORY
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
       4️⃣ GET LATEST MONTHLY BUDGET
    ============================== */
    // Get current month
/* ==============================
   4️⃣ GET CURRENT MONTH BUDGET
============================== */

const currentMonth = new Date().toLocaleString("default", {
  month: "short",
  year: "numeric",
});

const { data: budgetData, error: budgetError } = await supabase
  .from("budgets")
  .select("amount")
  .eq("user_id", userId)
  .eq("month", currentMonth)
  .maybeSingle();

if (budgetError) throw budgetError;

const monthlyBudget = budgetData?.amount ?? null;
    const remainingBudget = monthlyBudget - totalSpending;

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