import supabase from "../config/supabase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Email regex validation
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Password strength validation
const validatePassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*[@$!%*?&]).{5,}$/;
  return regex.test(password);
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1 Required field validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2 Email format validation
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // 3 Password strength validation
    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters and contain at least one letter and one number",
      });
    }

    // 4 Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // 5 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6 Insert new user
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
        },
      ])
      .select()
      .single(); //changed this 

      // Create default monthly budget (example: 5000)
       await supabase.from("budgets").insert([
     {
    user_id: data.id,
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    amount: 5000, // default budget
        },
        ]);

    if (error) throw error;

    res.status(201).json({
      message: "User registered successfully",
      user: data,
    });
  } catch (err) {
    res.status(500).json({
      message: "Registration failed",
      error: err.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Required field validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Login failed",
      error: err.message,
    });
  }
};