# Premium E-Shop

A full-stack e-commerce web application built with React.js, Node.js, and Express.js. The application provides a complete online shopping experience, including product browsing, authentication, cart management, checkout, order processing, and inventory updates.

## Features

### User Features

* User Registration and Login
* Product Catalog
* Product Search and Filtering
* Product Details Page
* Shopping Cart Management
* Secure Checkout Flow
* Order History
* Responsive User Interface

### Admin / Backend Features

* RESTful API Architecture
* Product Inventory Management
* Order Processing System
* Stock Quantity Updates
* User Authentication Middleware
* JSON-Based Data Persistence

## Tech Stack

### Frontend

* React.js
* JavaScript (ES6+)
* HTML5
* CSS3
* Vite

### Backend

* Node.js
* Express.js
* CORS

### Data Storage

* JSON Files (Products, Users, Orders)

## Project Structure

```text
premium-eshop/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── data/
│   │   ├── products.json
│   │   ├── users.json
│   │   └── orders.json
│   ├── server.js
│   └── package.json
│
└── README.md
```

## Installation

### Clone Repository

```bash
git clone https://github.com/HasanAgha719/E-Commerce-website.git
cd E-Commerce-website/premium-eshop
```

### Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Install Backend Dependencies

```bash
cd ../backend
npm install
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## API Endpoints

### Products

```http
GET /api/products
GET /api/products/:id
```

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Orders

```http
POST /api/orders
GET /api/orders
```

## Order Processing Workflow

1. User registers or logs in.
2. User browses products.
3. User adds products to cart.
4. User proceeds to checkout.
5. Backend validates inventory.
6. Taxes and shipping are calculated.
7. Order is stored in the database.
8. Product stock is updated automatically.
9. User can view order history.

## Future Improvements

* MongoDB Integration
* JWT Authentication
* Password Hashing using bcrypt
* Payment Gateway Integration
* Admin Dashboard
* Product Reviews and Ratings
* Wishlist Functionality
* Email Notifications

## Author

**Hasan Agha**

GitHub: https://github.com/HasanAgha719

## License

This project is created for educational and portfolio purposes.
