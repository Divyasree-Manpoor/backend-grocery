import supabase from "../config/supabase.js";
import { calculateTotal } from "../utils/calculateTotal.js";
import { applyCoupon } from "../utils/applyCoupon.js";

/* ============================================
   🛒 COMPLETE SHOPPING
============================================ */
/* ===========================
   💰 COMPLETE SHOPPING (SMART)
=========================== */

export const completeShopping = async (req, res) => {
  try {
    const userId = req.user.id;
    const { list_id ,store_name} = req.body;

    if (!list_id) {
      return res.status(400).json({ message: "List ID required" });
    }

    // 1️⃣ Get only purchased items
    const { data: items, error: itemError } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("list_id", list_id)
      .eq("purchased", true);

    if (itemError) throw itemError;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No purchased items found",
      });
    }

    let subtotal = 0;
    let totalDiscount = 0;

    // 2️⃣ Fetch coupons
    const { data: coupons } = await supabase
      .from("coupons")
      .select("*");

    // 3️⃣ Calculate totals
    items.forEach((item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      const itemTotal = price * quantity;

      subtotal += itemTotal;

      const matchedCoupon = coupons?.find(
        (c) =>
          c.item_name.toLowerCase().trim() ===
          item.item_name.toLowerCase().trim() &&
          new Date(c.valid_until) >= new Date()
      );

      if (matchedCoupon) {
        const discount =
          (itemTotal * matchedCoupon.discount_percentage) / 100;
        totalDiscount += discount;
      }
    });

    const finalTotal = subtotal - totalDiscount;

    // 4️⃣ Insert into shopping_history
    const { data: history, error: historyError } =
      await supabase
        .from("shopping_history")
        .insert([
          {
            user_id: userId,
            list_id,
            subtotal,
            discount_amount: totalDiscount,
            total_amount: finalTotal,
            store_name
          },
        ])
        .select()
        .single();

    if (historyError) throw historyError;

    // 5️⃣ Remove purchased items from grocery list
    const purchasedIds = items.map((item) => item.id);

    await supabase
      .from("grocery_items")
      .delete()
      .in("id", purchasedIds);

    res.status(200).json({
      message: "Shopping completed successfully",
      data: history,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
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
      message: "Failed to fetch shopping history",
    });
  }
};


export const getLatestShopping = async (req, res) => {

  try {

    const userId = req.user.id;

    const { data, error } = await supabase
      .from("shopping_history")
      .select(`
        id,
        subtotal,
        discount_amount,
        total_amount,
        completed_at,
        grocery_lists(title)
      `)
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

};


export const getBillByList = async (req, res) => {
  try {

    const { listId } = req.params;

    const { data, error } = await supabase
      .from("shopping_history")
      .select(`
        subtotal,
        discount_amount,
        total_amount,
        completed_at,
        grocery_lists(title)
      `)
      .eq("list_id", listId)
      .maybeSingle();

    if (error) throw error;

    res.json(data);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};

export const getLatestBill = async (req, res) => {
  try {

    const userId = req.user.id;

    const { data, error } = await supabase
      .from("shopping_history")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    res.json(data);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};

export const getBillById = async (req, res) => {
  try {

    const { id } = req.params;

    const { data, error } = await supabase
      .from("shopping_history")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bill" });
  }
};
