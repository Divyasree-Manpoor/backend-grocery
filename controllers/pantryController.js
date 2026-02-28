import supabase from "../config/supabase.js";

/* ===========================
   🥫 ADD PANTRY ITEM
=========================== */
export const addPantryItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_name, quantity, expiry_date } = req.body;

    if (!item_name) {
      return res.status(400).json({
        message: "Item name are required",
      });
    }

    const { data, error } = await supabase
      .from("pantry")
      .insert([
        {
          user_id: userId,
          item_name,
          quantity,
          expiry_date,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: "Pantry item added successfully",
      item: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===========================
   📦 GET PANTRY ITEMS
   (WITH EXPIRY + LOW STOCK)
=========================== */
export const getPantryItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("pantry")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    const today = new Date();

    const updatedData = data.map((item) => {
      let isExpired = false;
      let isExpiringSoon = false;
      let isLowStock = false;

      // Expiry Check
      if (item.expiry_date) {
        const expiryDate = new Date(item.expiry_date);
        const diffDays = (expiryDate - today) / (1000 * 60 * 60 * 24);

        if (diffDays < 0) {
          isExpired = true;
        } else if (diffDays <= 2) {
          isExpiringSoon = true;
        }
      }

      // Low Stock Check (quantity < 10)
      if (item.quantity < 10) {
        isLowStock = true;
      }

      return {
        ...item,
        isExpired,
        isExpiringSoon,
        isLowStock,
      };
    });

    res.status(200).json(updatedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* ===========================
   ✏ UPDATE PANTRY ITEM
=========================== */
export const updatePantryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { data: item } = await supabase
      .from("pantry")
      .select("*")
      .eq("id", id)
      .single();

    if (!item || item.user_id !== userId) {
      return res.status(403).json({
        message: "Not authorized to update this item",
      });
    }

    const { item_name, quantity, expiry_date } = req.body;

    const { data, error } = await supabase
      .from("pantry")
      .update({
        item_name,
        quantity,
        expiry_date,
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.status(200).json({
      message: "Pantry item updated successfully",
      item: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ===========================
   🗑 DELETE PANTRY ITEM
=========================== */
export const deletePantryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: item } = await supabase
      .from("pantry")
      .select("*")
      .eq("id", id)
      .single();

    if (!item || item.user_id !== userId) {
      return res.status(403).json({
        message: "Not authorized to delete this item",
      });
    }
    const { error } = await supabase.from("pantry").delete().eq("id", id);

    if (error) throw error;

    res.status(200).json({
      message: "Pantry item deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

