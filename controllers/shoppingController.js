import supabase from "../config/supabase.js";

/* ============================================
   COMPLETE SHOPPING
============================================ */

export const completeShopping = async (req, res) => {
  try {
    const { user_id, total_amount, discount_amount } = req.body;

    if (!user_id || total_amount === undefined) {
      return res.status(400).json({
        message: "user_id and total_amount are required",
      });
    }

    const { data, error } = await supabase
      .from("shopping_history")
      .insert([
        {
          user_id: user_id,
          total_amount: Number(total_amount),
          discount_amount: Number(discount_amount) || 0, // ✅ NEW
        },
      ])
      .select();

    if (error) {
      console.error("Insert Error:", error);
      return res.status(500).json({
        message: "Failed to save shopping history",
      });
    }

    return res.status(201).json({
      message: "Shopping completed successfully",
      data,
    });

  } catch (err) {
    console.error("Complete Shopping Error:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* ============================================
   GET SHOPPING HISTORY
============================================ */

export const getShoppingHistory = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ get from auth middleware

    const { data, error } = await supabase
      .from("shopping_history")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("Fetch Error:", error);
      return res.status(500).json({
        message: "Failed to fetch history",
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("History Error:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};