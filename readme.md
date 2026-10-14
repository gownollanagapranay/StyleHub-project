# StyleHub – E-Commerce Web Application

StyleHub is a full-stack e-commerce web application developed using **FastAPI, React, SQLite, SQLAlchemy, JWT Authentication, and Stripe**.

The project provides a simple shopping experience where users can register, log in, browse products, manage their cart, place orders, make payments, and view their order history.

---

### Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- JWT Authentication
- Stripe Payment API
- Uvicorn

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS

### Payment

- Stripe Test Mode

---

## Main Features

### User Authentication

- User registration
- User login
- Password hashing
- JWT-based authentication
- Protected APIs

### Product Management

- View all products
- Search products
- Filter products by category
- View individual products
- Add products
- Update products
- Delete products
- Product stock management
- Product images

### Shopping Cart

- Add products to cart
- View cart
- Update product quantity
- Remove products from cart
- Calculate subtotal
- Calculate total amount
- Stock validation

### Orders

- Create orders from cart
- Store order details
- Store order items
- Track order status
- View previous orders
- Order history

### Payments

- Stripe PaymentIntent integration
- Stripe Test Mode
- Payment verification
- Payment status tracking

---

# Project Structure

```text
StyleHub/
│
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── security.py
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── products.py
│   │   ├── cart.py
│   │   └── orders.py
│   │
│   └── services/
│       └── stripe_service.py
│
├── frontend/
│   ├── public/
│   │   └── products/
│   │       ├── tshirt.jpg
│   │       ├── jeans.jpg
│   │       └── ...
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── ProductList.jsx
│   │   ├── Register.jsx
│   │   ├── Login.jsx
│   │   ├── Cart.jsx
│   │   ├── Cart.css
│   │   ├── Checkout.jsx
│   │   ├── Checkout.css
│   │   ├── OrderHistory.jsx
│   │   └── ...
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── stylehub.db
├── .env
├── requirements.txt
└── README.md
```


# Backend Setup

## 1. Open the project

Open Command Prompt or PowerShell and navigate to the project:

```bash
cd StyleHub
```

---

## 2. Create a virtual environment

```bash
python -m venv venv
```

---

## 3. Activate the virtual environment

### Windows

```bash
venv\Scripts\activate
```
---

## 4. Install backend dependencies

```bash
pip install -r requirements.txt
```

---

# Environment Variables

Create a `.env` file inside the backend root:

```text
StyleHub/.env
```

Example:

```env
DATABASE_URL=sqlite:///./stylehub.db

SECRET_KEY=your_secret_key_here

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=1440

STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

Do not upload your real `.env` file to GitHub.

---

# Run the Backend

From the `StyleHub` directory:

```bash
uvicorn app.main:app --reload
```

---

# FastAPI Documentation

Once the backend is running, open:

```text
http://127.0.0.1:8000/docs
```

This opens the Swagger UI.

You can use Swagger to test the APIs.

Alternative documentation:

```text
http://127.0.0.1:8000/redoc
```

---

# Frontend Setup

Open another terminal.

Navigate to the frontend:

```bash
cd StyleHub/frontend
```

Install dependencies:

```bash
npm install
```

---

# Frontend Environment Variables

Create:

```text
StyleHub/frontend/.env
```

Example:

```env
VITE_API_URL=http://127.0.0.1:8000

VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

After changing `.env`, restart the Vite development server.

---

# Run the Frontend

From:

```text
StyleHub/frontend
```

run:

```bash
npm run dev
```

Vite will display a URL similar to:

```text
http://localhost:5173
```

Open that URL in your browser.

---

# Running the Complete Project

You need **two terminals**.

## Terminal 1 – Backend

```bash
cd StyleHub
venv\Scripts\activate
uvicorn app.main:app --reload
```

## Terminal 2 – Frontend

```bash
cd StyleHub/frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# Application Flow

The basic application flow is:

```text
Register
   ↓
Login
   ↓
Browse Products
   ↓
Search / Filter Products
   ↓
Add Product to Cart
   ↓
View Cart
   ↓
Checkout
   ↓
Create Order
   ↓
Stripe Payment
   ↓
Verify Payment
   ↓
Payment Successful
   ↓
View Orders
```

---

# Authentication Flow

StyleHub uses JWT authentication.

When a user logs in:

```text
User
 ↓
Login API
 ↓
Validate username/password
 ↓
Generate JWT token
 ↓
Frontend stores token
 ↓
Token sent with protected API requests
```

---

# Cart Flow

When a product is added to the cart:

```text
Product
   ↓
Add to Cart API
   ↓
Cart Item
   ↓
Quantity
   ↓
Subtotal
   ↓
Cart Total
```

The backend validates the product and available stock before adding or updating the cart item.

---

# Order Flow

When the user clicks **Place Order**:

```text
Cart
 ↓
Checkout API
 ↓
Create Order
 ↓
Create Order Items
 ↓
Calculate Total
 ↓
Reduce Product Stock
 ↓
Clear Cart
 ↓
Pending Order
```

---

# Stripe Payment Flow

StyleHub uses Stripe Test Mode.

The payment process is:

```text
Create Order
      ↓
Create Stripe PaymentIntent
      ↓
Receive Client Secret
      ↓
Stripe Payment Form
      ↓
Customer enters card details
      ↓
Stripe processes test payment
      ↓
Verify Payment
      ↓
Order marked as Paid
```

---

# Stripe Test Card

For testing Stripe payments, use:

```text
Card Number:
4242 4242 4242 4242
```

Use:

```text
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any valid value
```

This is a Stripe test card and should only be used with Stripe Test Mode.

---

# Database

StyleHub uses SQLite.

Database file:

```text
stylehub.db
```

The database contains application data such as:

```text
Users
Products
Cart Items
Orders
Order Items
```

SQLite does not require a separate database server for this project.

You can inspect the database using tools such as **DB Browser for SQLite**.

---

# API Endpoints

## Authentication

```text
POST /auth/register
POST /auth/login
```

---

## Products

```text
GET    /products/
GET    /products/{product_id}
POST   /products/
PUT    /products/{product_id}
DELETE /products/{product_id}
```

---

## Cart

```text
POST   /cart/
GET    /cart/
PUT    /cart/{item_id}
DELETE /cart/{item_id}
```

---

## Orders

```text
POST /orders/checkout
POST /orders/{order_id}/payment
POST /orders/{order_id}/verify-payment
```

---

# Frontend Pages

The frontend contains simple pages/components for:

```text
Login
Register
Products
Cart
Checkout
Order History
```

The UI is intentionally kept simple so that the main focus remains on backend development, APIs, database operations, authentication, and payment integration.

---

# No Docker Required

This project runs completely without Docker Desktop.

Required services:

```text
FastAPI
   ↓
SQLite

React
   ↓
FastAPI

Stripe
   ↓
Stripe Test API
```

There is no requirement for:

```text
Docker Desktop
Docker Compose
MySQL Server
PostgreSQL Server
Redis
```

SQLite is used as the local database.

---

# Common Commands

## Activate virtual environment

```bash
venv\Scripts\activate
```

## Install Python dependencies

```bash
pip install -r requirements.txt
```

## Start FastAPI

```bash
uvicorn app.main:app --reload
```

## Install frontend dependencies

```bash
cd frontend
npm install
```

## Start React/Vite

```bash
npm run dev
```

---

# Troubleshooting

## Backend does not start

Make sure the virtual environment is activated:

```bash
venv\Scripts\activate
```

Then install dependencies:

```bash
pip install -r requirements.txt
```

Run:

```bash
uvicorn app.main:app --reload
```

---

## Frontend does not start

Inside the frontend directory:

```bash
npm install
```

Then:

```bash
npm run dev
```

---

## Stripe payment does not work

Check:

```text
frontend/.env
```

Make sure the Stripe publishable key exists:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Check the backend `.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
```

Restart both backend and frontend after changing environment variables.

---

## API connection error

Make sure FastAPI is running:

```text
http://127.0.0.1:8000
```

Then check Swagger:

```text
http://127.0.0.1:8000/docs
```

Also verify the frontend API URL:

```env
VITE_API_URL=http://127.0.0.1:8000
```

---
