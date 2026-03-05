import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import supabase from "./config/supabase.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import groceryRoutes from "./routes/groceryRoutes.js";
import pantryRoutes from "./routes/pantryRoutes.js";
import mealRoutes from "./routes/mealRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import shoppingRoutes from "./routes/shoppingRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/grocery", groceryRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/shopping", shoppingRoutes);
app.use("/api/grocery/coupons", couponRoutes);
app.use("/api/users", userRoutes);

app.use("/api/budget",budgetRoutes);
// Test Route
app.get("/", (req, res) => {
  res.send("Backend Server is Running 🚀");
});

// 🔥 Test Supabase Connection
const testDatabaseConnection = async () => {
  try {
    const { error } = await supabase
      .from("users")
      .select("id")
      .limit(1);

    if (error) throw error;

    console.log("✅ Supabase Database Connected Successfully");
  } catch (err) {
    console.error("❌ Supabase Connection Failed:", err.message);
  }
};

testDatabaseConnection();

// Error middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 9392;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});