import supabase from "../config/supabase.js";

export const saveMonthlyBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    const currentMonth = new Date().toISOString().slice(0, 7); // 2026-02

    const { data: existing } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("budgets")
        .update({ amount })
        .eq("id", existing.id);
    } else {
      await supabase.from("budgets").insert([
        {
          user_id: userId,
          month: currentMonth,
          amount,
        },
      ]);
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const getCurrentMonthBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data } = await supabase
      .from("budgets")
      .select("amount")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .maybeSingle();

    res.json({
      success: true,
      amount: data?.amount ?? 0,
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};