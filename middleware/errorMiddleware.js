// middleware/errorMiddleware.js

export const errorHandler = (err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Supabase duplicate error
  if (err.code === "23505") {
    statusCode = 400;
    message = "Duplicate entry detected";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};