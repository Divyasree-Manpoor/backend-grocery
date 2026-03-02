import supabase from "../config/supabase.js";

/* ===============================
   SAVE / UPDATE MONTHLY BUDGET
================================= */
export const saveMonthlyBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid budget amount is required",
      });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Check if budget already exists for this month & year
    const { data: existing, error: findError } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .maybeSingle();

    if (findError) {
      return res.status(400).json({
        success: false,
        message: findError.message,
      });
    }

    if (existing) {
      // Update existing budget
      const { error: updateError } = await supabase
        .from("budgets")
        .update({ amount })
        .eq("id", existing.id);

      if (updateError) {
        return res.status(400).json({
          success: false,
          message: updateError.message,
        });
      }
    } else {
      // Insert new budget
      const { error: insertError } = await supabase
        .from("budgets")
        .insert([
          {
            user_id: userId,
            month: currentMonth,
            year: currentYear,
            amount,
          },
        ]);

      if (insertError) {
        return res.status(400).json({
          success: false,
          message: insertError.message,
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Budget Save Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while saving budget",
    });
  }
};

/* ===============================
   GET CURRENT MONTH BUDGET
================================= */
export const getCurrentMonthBudget = async (req, res) => {
  try {
    const userId = req.user.id;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const { data, error } = await supabase
      .from("budgets")
      .select("amount")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .maybeSingle();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      amount: data?.amount ?? 0,
    });
  } catch (err) {
    console.error("Budget Fetch Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching budget",
    });
  }
};