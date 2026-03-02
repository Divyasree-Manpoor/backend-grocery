// utils/formatHelper.js

export const formatCurrency = (amount) => {
  return `₹${Number(amount).toFixed(2)}`;
};

export const formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

export const normalizeString = (str) => {
  return str?.trim().toLowerCase();
};