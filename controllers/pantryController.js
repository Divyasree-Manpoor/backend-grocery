import supabase from "../config/supabase.js";

const allowedUnits = ["kg", "g", "L", "ml", "pcs", "packet", "dozen"];

/* =====================================================
   🥫 ADD PANTRY ITEM
===================================================== */
export const addPantryItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_name, quantity, unit, expiry_date } = req.body;

    if (!item_name || !unit || quantity === undefined) {
      return res.status(400).json({
        message: "Item name, quantity and unit are required",
      });
    }

    if (!allowedUnits.includes(unit)) {
      return res.status(400).json({
        message: "Invalid unit type",
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    const { data, error } = await supabase
      .from("pantry")
      .insert([
        {
          user_id: userId,
          item_name: item_name.trim().toLowerCase(),
          quantity: Number(quantity),
          unit,
          expiry_date: expiry_date || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data); // ✅ return item directly
  } catch (err) {
    return res.status(500).json({
      message: "Failed to add pantry item",
      error: err.message,
    });
  }
};

/* =====================================================
   📦 GET PANTRY ITEMS
===================================================== */
export const getPantryItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("pantry")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const today = new Date();

    const enhanced = data.map((item) => {
      let isExpired = false;
      let isExpiringSoon = false;
      let isLowStock = false;

      if (item.expiry_date) {
        const expiry = new Date(item.expiry_date);
        const diffDays =
          (expiry - today) / (1000 * 60 * 60 * 24);

        if (diffDays < 0) isExpired = true;
        else if (diffDays <= 2) isExpiringSoon = true;
      }

      if (
        (item.unit === "kg" && item.quantity < 1) ||
        (item.unit === "litre" && item.quantity < 1) ||
        (item.unit === "g" && item.quantity < 100) ||
        (item.unit === "ml" && item.quantity < 100) ||
        (item.unit === "piece" && item.quantity < 3) ||
        (item.unit === "packet" && item.quantity < 1) ||
        (item.unit === "dozen" && item.quantity < 1)
      ) {
        isLowStock = true;
      }

      return {
        ...item,
        isExpired,
        isExpiringSoon,
        isLowStock,
      };
    });

    return res.status(200).json(enhanced);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch pantry items",
      error: err.message,
    });
  }
};

/* =====================================================
   ✏ UPDATE PANTRY ITEM
===================================================== */
export const updatePantryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { item_name, quantity, unit, expiry_date } = req.body;

    const { data: existing, error: fetchError } = await supabase
      .from("pantry")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!existing || existing.user_id !== userId) {
      return res.status(403).json({
        message: "Not authorized to update this item",
      });
    }

    if (unit && !allowedUnits.includes(unit)) {
      return res.status(400).json({
        message: "Invalid unit type",
      });
    }

    const updatePayload = {
      ...(item_name && { item_name: item_name.trim().toLowerCase() }),
      ...(quantity !== undefined && { quantity: Number(quantity) }),
      ...(unit && { unit }),
      ...(expiry_date !== undefined && { expiry_date }),
    };

    const { data, error } = await supabase
      .from("pantry")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data); // ✅ return item directly
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update pantry item",
      error: err.message,
    });
  }
};

/* =====================================================
   🗑 DELETE PANTRY ITEM
===================================================== */
export const deletePantryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: existing, error } = await supabase
      .from("pantry")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!existing || existing.user_id !== userId) {
      return res.status(403).json({
        message: "Not authorized to delete this item",
      });
    }

    await supabase.from("pantry").delete().eq("id", id);

    return res.status(200).json({
      message: "Pantry item deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete pantry item",
      error: err.message,
    });
  }
};