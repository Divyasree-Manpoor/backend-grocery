export const errorHandler = (err, req, res, next) => {
  // Log full error for debugging
  console.error("🔥 Error:", err);

  // If status already set in controller use it, otherwise 500
  const statusCode = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};