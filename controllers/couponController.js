import supabase from "../config/supabase.js";

/* ============================================
   🎟 GET VALID COUPONS FOR A LIST
============================================ */
export const getCouponsForList = async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user.id;

    if (!listId) {
      return res.status(400).json({
        message: "List ID is required",
      });
    }

    // 1️⃣ Verify list belongs to user
    const { data: list, error: listError } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("id", listId)
      .maybeSingle();

    if (listError) throw listError;

    if (!list || list.user_id !== userId) {
      return res.status(403).json({
        message: "Not authorized to access this list",
      });
    }

    // 2️⃣ Get grocery items in list
    const { data: items, error: itemError } = await supabase
      .from("grocery_items")
      .select("item_name")
      .eq("list_id", listId);

    if (itemError) throw itemError;

    if (!items || items.length === 0) {
      return res.status(200).json([]);
    }

    const itemNames = items.map((item) =>
      item.item_name.toLowerCase()
    );

    // 3️⃣ Get all coupons
    const { data: coupons, error: couponError } = await supabase
      .from("coupons")
      .select("*");

    if (couponError) throw couponError;

    const today = new Date();

    // 4️⃣ Filter matching + valid coupons
    const validCoupons = coupons.filter((coupon) => {
      const isMatching = itemNames.includes(
        coupon.item_name.toLowerCase()
      );

      const isValid =
        !coupon.valid_until ||
        new Date(coupon.valid_until) >= today;

      return isMatching && isValid;
    });

    return res.status(200).json(validCoupons);

  } catch (err) {
    console.error("Coupon Error:", err);
    return res.status(500).json({
      message: "Failed to fetch coupons",
    });
  }
};