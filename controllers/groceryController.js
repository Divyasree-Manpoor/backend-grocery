import supabase from "../config/supabase.js";

/* ===========================
    GROCERY LIST CONTROLLERS
=========================== */

// Create Grocery List
export const createList = async (req, res) => {
  try {
    const user_id = req.user.id; 
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const { data, error } = await supabase
      .from("grocery_lists")
      .insert([{ user_id, title }])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: "List created successfully",
      list: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get All Lists of a User
export const getLists = async (req, res) => {
  try {
    const userId = req.user.id;

    // Own lists
    const { data: ownLists } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("user_id", userId);

    // Shared lists
    const { data: shared } = await supabase
      .from("shared_lists")
      .select("grocery_lists(*)")
      .eq("shared_with", userId);

    const sharedLists = shared?.map(s => s.grocery_lists) || [];

    res.status(200).json([
      ...ownLists,
      ...sharedLists
    ]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Grocery List Title
export const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    const { data: list } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("id", id)
      .single();

    if (!list) {
     return res.status(404).json({ message: "List not found" });
    }
    if (list.user_id !== userId) {
      // check if shared user
      const { data: shared } = await supabase
        .from("shared_lists")
        .select("*")
        .eq("list_id", id)
        .eq("shared_with", userId)
        .single();

         if (!shared) {
        return res.status(403).json({
          message: "Not authorized to update this list",
        });
      }
    }

    const { data, error } = await supabase
      .from("grocery_lists")
      .update({ title })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.status(200).json({
      message: "List updated successfully",
      list: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Delete Grocery List
export const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if list belongs to user
    const { data: list } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("id", id)
      .single();

    if (!list || list.user_id !== userId) {
      return res.status(403).json({
        message: "Not authorized to delete this list",
      });
    }

    const { error } = await supabase
      .from("grocery_lists")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({
      message: "List deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* ===========================
   🛍 GROCERY ITEM CONTROLLERS*/

// Add Item to List
export const addItem = async (req, res) => {
  try {
    const { list_id, item_name, category, quantity, price } = req.body;
     const userId = req.user.id;

     if (!list_id || !item_name) {
      return res.status(400).json({
        message: "List ID and item name are required",
      });
    }

     const { data: list } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("id", list_id)
      .single();

      if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // Owner or shared?
    if (list.user_id !== userId) {
      const { data: shared } = await supabase
        .from("shared_lists")
        .select("*")
        .eq("list_id", list_id)
        .eq("shared_with", userId)
        .single();
        if (!shared) {
        return res.status(403).json({
          message: "Not authorized to add item",
        });
      }
    }
    const { data, error } = await supabase
      .from("grocery_items")
      .insert([
        {
          list_id,
          item_name,
          category,
          quantity,
          price,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: "Item added successfully",
      item: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Items by List
export const getItems = async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user.id;

    // Check if list exists
    const { data: list } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("id", listId)
      .single();

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // If not owner → check shared access
    if (list.user_id !== userId) {
      const { data: shared } = await supabase
        .from("shared_lists")
        .select("*")
        .eq("list_id", listId)
        .eq("shared_with", userId)
        .single();

      if (!shared) {
        return res.status(403).json({
          message: "Not authorized to view items",
        });
      }
    }

    const { data, error } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("list_id", listId);

    if (error) throw error;

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Update Item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
     const userId = req.user.id;

    const { data: item } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("id", id)
      .single();

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const { data: list } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("id", item.list_id)
      .single();

    if (list.user_id !== userId) {
      const { data: shared } = await supabase
        .from("shared_lists")
        .select("*")
        .eq("list_id", list.id)
        .eq("shared_with", userId)
        .single();

        if (!shared) {
        return res.status(403).json({
          message: "Not authorized to update item",
        });
      }
    }

    const { item_name, category, quantity, price, purchased } = req.body;

    const { data, error } = await supabase
      .from("grocery_items")
      .update({
        item_name,
        category,
        quantity,
        price,
        purchased,
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.status(200).json({
      message: "Item updated successfully",
      item: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { data: item } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("id", id)
      .single();

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
     const { data: list } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("id", item.list_id)
      .single();

    if (list.user_id !== userId) {
      const { data: shared } = await supabase
        .from("shared_lists")
        .select("*")
        .eq("list_id", list.id)
        .eq("shared_with", userId)
        .single();
       if (!shared) {
        return res.status(403).json({
          message: "Not authorized to delete item",
        });
      }
    } 
    const { error } = await supabase
      .from("grocery_items")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({
      message: "Item deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// getBudgetSummary
export const getBudgetSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data } = await supabase
      .from("grocery_lists")
      .select("grocery_items(price)")
      .eq("user_id", userId);

    let total = 0;

    data.forEach(list => {
      list.grocery_items?.forEach(item => {
        total += item.price || 0;
      });
    });

    res.status(200).json({
      total_spending: total,
      budget_limit: req.user.budget_limit || 0
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// shopping
export const completeShopping = async (req, res) => {
  try {
    console.log("USER:", req.user);
    console.log("BODY:", req.body);

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    const { total_amount } = req.body;

    if (!total_amount) {
      return res.status(400).json({
        message: "Total amount is required",
      });
    }

    const { data, error } = await supabase
      .from("shopping_history")
      .insert([
        {
          user_id: userId,
          total_amount: total_amount,
        },
      ])
      .select();

    if (error) {
      console.log("INSERT ERROR:", error);
      throw error;
    }

    res.status(200).json({
      message: "Shopping completed and saved",
      data,
    });

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
// ===============================
// GET SHOPPING HISTORY

export const getShoppingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("shopping_history")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error) throw error;

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// GET COUPONS FOR A LIST
// ===============================
export const getCouponsForList = async (req, res) => {
  try {
    const { listId } = req.params;

    // Get all items in the list
    const { data: items } = await supabase
      .from("grocery_items")
      .select("item_name")
      .eq("list_id", listId);


    if (!items || items.length === 0) {
      return res.status(200).json([]);
    }

    const itemNames = items.map(item => item.item_name.toLowerCase());

    // Get coupons matching those items
    const { data: coupons } = await supabase
      .from("coupons")
      .select("*");

      const filteredCoupons = coupons.filter(c =>
      itemNames.includes(c.item_name.toLowerCase())
    );

    res.status(200).json(filteredCoupons);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ===============================
// ADD PANTRY ITEM
// ===============================

export const addPantryItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_name, quantity, unit, expiry_date } = req.body;

    const { data, error } = await supabase
      .from("pantry")
      .insert([
        {
          user_id: userId,
          item_name,
          quantity,
          unit,
          expiry_date,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getPantryItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("pantry")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ===============================
// SHARE GROCERY LIST
// ===============================

export const shareList = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { list_id, email, permission } = req.body;

    if (!list_id || !email) {
      return res.status(400).json({
        message: "List ID and email are required",
      });
    }

    // 🔍 Find user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 🔍 Verify list belongs to owner
    const { data: list } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("id", list_id)
      .single();

    if (!list || list.user_id !== ownerId) {
      return res.status(403).json({
        message: "Not authorized to share this list",
      });
    }

    // 🔥 Prevent duplicate share
    const { data: existing } = await supabase
      .from("shared_lists")
      .select("*")
      .eq("list_id", list_id)
      .eq("shared_with", user.id)
      .single();

    if (existing) {
      return res.status(400).json({
        message: "List already shared with this user",
      });
    }

    // 🔥 Insert share record
    const { error } = await supabase
      .from("shared_lists")
      .insert([
        {
          list_id,
          owner_id: ownerId,
          shared_with: user.id,
          permission: permission || "edit",
        },
      ]);

    if (error) throw error;

    res.status(200).json({
      message: "List shared successfully",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};