# 🛒 Grocery List Manager – Backend

## 📌 Project Overview

The Grocery List Manager Backend is built using Node.js and Express.js and serves as the API layer for the full-stack Grocery List Manager application.

This backend handles user authentication, grocery list creation, pantry tracking, meal planning, budget management, shopping history, and dashboard analytics.

It is fully integrated with Supabase (PostgreSQL) as the database and follows a clean MVC (Model-View-Controller) architecture to ensure modularity, scalability, and maintainability.

---

## 🚀 Tech Stack

- Node.js
- Express.js
- Supabase (PostgreSQL Database)
- dotenv (Environment Variables)
- CORS
- JSON Web Token (JWT)
- bcrypt (Password Hashing)
- Postman (API Testing)

---

## 🏗️ Project Architecture

The backend follows the MVC architecture pattern:

backend/
│
├── controllers/
├── routes/
├── middleware/
├── config/
├── utils/
└── server.js

### Architecture Explanation

- **Routes** → Define API endpoints
- **Controllers** → Contain business logic
- **Middleware** → Handle authentication and error handling
- **Config** → Supabase database configuration
- **Utils** → Helper functions
- **server.js** → Entry point of the backend server

---

## 🔐 Authentication

Authentication is implemented using JWT (JSON Web Token).

Features include:
- User Registration
- User Login
- Protected Routes using middleware
- Secure password hashing with bcrypt

---

## 📦 API Documentation

### 🔑 Authentication Routes
- `POST /api/auth/register` → Register a new user
- `POST /api/auth/login` → Login an existing user

### 🛒 Grocery List Routes
- `POST /api/grocery/lists` → Create a grocery list
- `GET /api/grocery/lists` → Get all grocery lists
- `PUT /api/grocery/lists/:id` → Update a grocery list
- `DELETE /api/grocery/lists/:id` → Delete a grocery list

### 📦 Grocery Item Routes
- `POST /api/grocery/items` → Add an item to the grocery list
- `GET /api/grocery/items/:listId` → Get items in a grocery list
- `PUT /api/grocery/items/:id` → Update an item in the grocery list
- `DELETE /api/grocery/items/:id` → Delete an item from the grocery list

### 🥫 Pantry Routes
- `POST /api/pantry` → Add a pantry item
- `GET /api/pantry` → Get all pantry items
- `PUT /api/pantry/:id` → Update a pantry item
- `DELETE /api/pantry/:id` → Delete a pantry item

### 🍽️ Meal Planning Routes
- `POST /api/meals/plans` → Create a new meal plan
- `GET /api/meals/plans` → Get all meal plans
- `DELETE /api/meals/plans/:id` → Delete a meal plan
- `GET /api/meals/suggestions` → Suggest meals based on pantry and preferences

### 💰 Budget Routes
- `GET /api/budget` → Get the current user's budget
- `POST /api/budget` → Set a new budget

### 🛍️ Shopping Routes
- `POST /api/shopping/complete` → Complete shopping and save history
- `GET /api/shopping/history` → Get shopping history for the user

### 📊 Dashboard Route
- `GET /api/dashboard/stats` → Get dashboard statistics

---

## 🗄️ Database Schema (Supabase)

The backend connects to Supabase using the official `@supabase/supabase-js` client.

### Main Tables

- **Users**
- **Grocery Lists**
- **Grocery Items**
- **Pantry**
- **Meals**
- **Budget**

---

## 🧪 API Testing

All backend APIs were tested using Postman to verify:
- Authentication flow
- CRUD operations
- Protected route access
- Database response handling
- Error handling

---

## ⚙️ Installation & Setup

1️⃣ Clone the repository:

```bash
git clone https://github.com/Divyasree-Manpoor/backend-grocery
cd grocery-backend