import supabase from "../config/supabase.js";

/* ============================================
   🛒 COMPLETE SHOPPING
============================================ */
export const completeShopping = async (req, res) => {
  try {
    const userId = req.user.id;
    const { list_id, discount_amount } = req.body;

    if (!list_id) {
      return res.status(400).json({
        message: "List ID is required",
      });
    }

    // 1️⃣ Get list items
    const { data: items, error: itemsError } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("list_id", list_id);

    if (itemsError) throw itemsError;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No items found in this list",
      });
    }

    // 2️⃣ Calculate total
    let totalAmount = 0;

    items.forEach((item) => {
      totalAmount += Number(item.quantity) * Number(item.price || 0);
    });

    const discount = Number(discount_amount) || 0;

    if (discount < 0) {
      return res.status(400).json({
        message: "Invalid discount amount",
      });
    }

    const finalAmount = totalAmount - discount;

    // 3️⃣ Insert into history
    const { data, error } = await supabase
      .from("shopping_history")
      .insert([
        {
          user_id: userId,
          list_id,
          total_amount: finalAmount,
          discount_amount: discount,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // 4️⃣ Mark items purchased
    await supabase
      .from("grocery_items")
      .update({ purchased: true })
      .eq("list_id", list_id);

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
   📜 GET SHOPPING HISTORY
============================================ */
export const getShoppingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("shopping_history")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);

  } catch (err) {
    console.error("History Error:", err);
    return res.status(500).json({
      message: "Failed to fetch history",
    });
  }
};