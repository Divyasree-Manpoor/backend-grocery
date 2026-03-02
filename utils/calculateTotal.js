// utils/calculateTotal.js

export const calculateTotal = (items = []) => {
  let total = 0;

  items.forEach((item) => {
    total += Number(item.quantity || 0) * Number(item.price || 0);
  });

  return Number(total.toFixed(2));
};