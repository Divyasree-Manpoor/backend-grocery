import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { validateRequiredFields } from "../middleware/validateMiddleware.js";

const router = express.Router();

/* ===========================
   🔐 AUTH ROUTES
=========================== */

// Register
router.post(
  "/register",
  validateRequiredFields(["name", "email", "password"]),
  registerUser
);

// Login
router.post(
  "/login",
  validateRequiredFields(["email", "password"]),
  loginUser
);

export default router;