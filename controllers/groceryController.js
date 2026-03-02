import supabase from "../config/supabase.js";

/* ===========================
   🛒 GROCERY LIST CONTROLLERS
=========================== */

// Create Grocery List
export const createList = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const { data, error } = await supabase
      .from("grocery_lists")
      .insert([{ user_id, title }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "List created", list: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get Lists (Own + Shared)
export const getLists = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: ownLists } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("user_id", userId);

    const { data: shared } = await supabase
      .from("shared_lists")
      .select("grocery_lists(*)")
      .eq("shared_with", userId);

    const sharedLists = shared?.map((s) => s.grocery_lists) || [];

    res.status(200).json([...(ownLists || []), ...sharedLists]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const { data: list } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!list || list.user_id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { data, error } = await supabase
      .from("grocery_lists")
      .update({ title })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "List updated", list: data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Grocery List
export const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: list } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!list || list.user_id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await supabase.from("grocery_lists").delete().eq("id", id);

    res.json({ message: "List deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===========================
   🤝 SHARE LIST
=========================== */

export const shareList = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { list_id, email, permission } = req.body;

    if (!list_id || !email) {
      return res.status(400).json({
        message: "List ID and email are required",
      });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { data: list } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("id", list_id)
      .maybeSingle();

    if (!list || list.user_id !== ownerId) {
      return res.status(403).json({ message: "Not authorized to share" });
    }

    await supabase.from("shared_lists").insert([
      {
        list_id,
        owner_id: ownerId,
        shared_with: user.id,
        permission: permission || "edit",
      },
    ]);

    res.json({ message: "List shared successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===========================
   🛍 GROCERY ITEM CONTROLLERS
=========================== */

const allowedUnits = ["kg", "g", "litre", "ml", "piece", "packet", "dozen"];

export const addItem = async (req, res) => {
  try {
    const { list_id, item_name, category, quantity, unit, price } = req.body;
    const userId = req.user.id;

    if (!list_id || !item_name || !quantity || !unit) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!allowedUnits.includes(unit)) {
      return res.status(400).json({ message: "Invalid unit type" });
    }

    const { data: list } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("id", list_id)
      .maybeSingle();

    if (!list || list.user_id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { data, error } = await supabase
      .from("grocery_items")
      .insert([
        {
          list_id,
          item_name: item_name.toLowerCase(),
          category,
          quantity,
          unit,
          price: price || 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Item added", item: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getItems = async (req, res) => {
  try {
    const { listId } = req.params;

    const { data, error } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("list_id", listId);

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, quantity, unit, price, purchased } = req.body;

    if (unit && !allowedUnits.includes(unit)) {
      return res.status(400).json({ message: "Invalid unit type" });
    }

    const { data, error } = await supabase
      .from("grocery_items")
      .update({
        item_name: item_name?.toLowerCase(),
        quantity,
        unit,
        price,
        purchased,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Item updated", item: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from("grocery_items").delete().eq("id", id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===========================
   💰 COMPLETE SHOPPING
=========================== */

export const completeShopping = async (req, res) => {
  try {
    const userId = req.user.id;
    const { list_id } = req.body;

    if (!list_id) {
      return res.status(400).json({ message: "List ID required" });
    }

    const { data: items } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("list_id", list_id);

    let total = 0;

    items?.forEach((item) => {
      total += Number(item.quantity) * Number(item.price || 0);
    });

    const { data, error } = await supabase
      .from("shopping_history")
      .insert([
        {
          user_id: userId,
          list_id,
          total_amount: total,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Shopping completed", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===========================
   📜 SHOPPING HISTORY
=========================== */

export const getShoppingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data } = await supabase
      .from("shopping_history")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===========================
   🎟 COUPONS
=========================== */

export const getCouponsForList = async (req, res) => {
  try {
    const { listId } = req.params;

    const { data: items } = await supabase
      .from("grocery_items")
      .select("item_name")
      .eq("list_id", listId);

    const itemNames = items?.map((i) => i.item_name.toLowerCase()) || [];

    const { data: coupons } = await supabase.from("coupons").select("*");

    const validCoupons =
      coupons?.filter(
        (c) =>
          itemNames.includes(c.item_name.toLowerCase()) &&
          new Date(c.valid_until) >= new Date()
      ) || [];

    res.json(validCoupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===========================
   🥫 PANTRY
=========================== */

export const addPantryItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_name, quantity, unit, expiry_date } = req.body;

    if (!allowedUnits.includes(unit)) {
      return res.status(400).json({ message: "Invalid unit type" });
    }

    const { data, error } = await supabase
      .from("pantry")
      .insert([
        {
          user_id: userId,
          item_name: item_name.toLowerCase(),
          quantity,
          unit,
          expiry_date,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPantryItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data } = await supabase
      .from("pantry")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===========================
   🔓 PUBLIC SHARED LIST
=========================== */

export const getSharedList = async (req, res) => {
  try {
    const { id } = req.params;

    // Get list
    const { data: list, error: listError } = await supabase
      .from("grocery_lists")
      .select("title")
      .eq("id", id)
      .maybeSingle();

    if (listError || !list) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    // Get items
    const { data: items, error: itemError } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("list_id", id);

    if (itemError) {
      return res.status(500).json({
        message: "Failed to fetch items",
      });
    }

    res.status(200).json({
      title: list.title,
      items: items || [],
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};