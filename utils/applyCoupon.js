// utils/applyCoupon.js

export const applyCoupon = (totalAmount, coupon) => {
  if (!coupon) return { finalAmount: totalAmount, discount: 0 };

  const today = new Date();

  // Check expiry
  if (coupon.valid_until && new Date(coupon.valid_until) < today) {
    return {
      finalAmount: totalAmount,
      discount: 0,
      message: "Coupon expired",
    };
  }

  const discount =
    (Number(totalAmount) * Number(coupon.discount_percentage)) / 100;

  const finalAmount = Math.max(totalAmount - discount, 0);

  return {
    finalAmount,
    discount,
  };
};