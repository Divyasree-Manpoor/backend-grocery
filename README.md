# 🛒 Grocery List Manager – Backend

## 📌 Project Overview

The Grocery List Manager Backend is built using Node.js and Express.js and serves as the API layer for the full-stack Grocery List Manager application.

This backend handles user authentication, grocery list creation, pantry tracking, meal planning, budget management, shopping history, and dashboard analytics.

It is fully integrated with Supabase (PostgreSQL) as the database and follows a clean MVC (Model-View-Controller) architecture to ensure modularity, scalability, and maintainability.

All APIs were tested using Postman to verify request-response flow and proper database integration.

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

This structure ensures clean separation of concerns and professional project organization.

---

## 🔐 Authentication

Authentication is implemented using JWT (JSON Web Token).

Features include:

- User Registration
- User Login
- Protected Routes using middleware
- Secure password hashing with bcrypt

All protected routes require a valid Bearer token in the request headers.

---

## 📦 API Documentation

### 🔑 Authentication Routes
- `POST /api/auth/register`
- `POST /api/auth/login`

---

### 🛒 Grocery List Routes
- `POST /api/grocery/list`
- `GET /api/grocery/lists`
- `PUT /api/grocery/list/:id`
- `DELETE /api/grocery/list/:id`

---

### 📦 Grocery Item Routes
- `POST /api/grocery/item`
- `GET /api/grocery/items/:listId`
- `PUT /api/grocery/item/:id`
- `DELETE /api/grocery/item/:id`

---

### 🥫 Pantry Routes
- `POST /api/pantry`
- `GET /api/pantry`
- `PUT /api/pantry/:id`
- `DELETE /api/pantry/:id`

---

### 🍽️ Meal Planning Routes
- `POST /api/meals`
- `GET /api/meals`

---

### 💰 Budget Routes
- `GET /api/budget`
- `POST /api/budget`

---

### 🛍️ Shopping Routes
- `POST /api/shopping/complete`
- `GET /api/shopping/history`

---

### 📊 Dashboard Route
- `GET /api/dashboard`

---

## 🗄️ Database Schema (Supabase)

The backend connects to Supabase using the official `@supabase/supabase-js` client.

### Main Tables

### 👤 Users
- id (Primary Key)
- name
- email
- password (hashed)
- created_at

### 🛒 Grocery Lists
- id (Primary Key)
- user_id (Foreign Key → Users)
- title
- created_at

### 📦 Grocery Items
- id (Primary Key)
- list_id (Foreign Key → Grocery Lists)
- item_name
- quantity
- price
- category

### 🥫 Pantry
- id (Primary Key)
- user_id (Foreign Key → Users)
- item_name
- quantity
- expiration_date

### 🍽️ Meals
- id (Primary Key)
- user_id
- meal_name
- ingredients
- scheduled_date

### 💰 Budget
- id (Primary Key)
- user_id
- total_budget
- period

All relationships are maintained using foreign keys to ensure proper normalization and data integrity.

---

## 🧪 API Testing

All backend APIs were tested using Postman to verify:

- Authentication flow
- CRUD operations
- Protected route access
- Database response handling
- Error handling

Postman ensured smooth integration between Backend and Supabase Database.

---

## ⚙️ Installation & Setup

1️⃣ Clone the repository:

```bash
git clone https://github.com/Divyasree-Manpoor/backend-grocery>
cd grocery-backend