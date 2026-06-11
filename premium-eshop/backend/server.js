import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Paths to our JSON "tables"
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// Helper to read JSON
async function readData(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

// Helper to write JSON
async function writeData(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// Auth Middleware (Mock JWT)
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  if (!token.startsWith('mock-token-')) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  const userId = token.replace('mock-token-', '');
  const users = await readData(USERS_FILE);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(401).json({ message: 'User session not found' });
  }

  req.user = user;
  next();
}

// ---------------- PRODUCTS ENDPOINTS ----------------

// Get all products (with search, filter, and sorting)
app.get('/api/products', async (req, res) => {
  const { q, category, sort } = req.query;
  let products = await readData(PRODUCTS_FILE);

  // Filter by search query
  if (q) {
    const query = q.toLowerCase();
    products = products.filter(
      p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
    );
  }

  // Filter by category
  if (category && category !== 'All') {
    products = products.filter(
      p => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Sort products
  if (sort) {
    if (sort === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    }
  }

  res.json(products);
});

// Get a single product
app.get('/api/products/:id', async (req, res) => {
  const products = await readData(PRODUCTS_FILE);
  const product = products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});


// ---------------- AUTH ENDPOINTS ----------------

// Register User
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all details (name, email, password)' });
  }

  const users = await readData(USERS_FILE);
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password // In production, hash this password!
  };

  users.push(newUser);
  await writeData(USERS_FILE, users);

  const token = `mock-token-${newUser.id}`;
  
  // Exclude password from response
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ token, user: userWithoutPassword });
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const users = await readData(USERS_FILE);
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = `mock-token-${user.id}`;
  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});


// ---------------- ORDER & CHECKOUT ENDPOINTS ----------------

// Create Order (Checkout)
app.post('/api/orders', authenticateUser, async (req, res) => {
  const { items, shippingAddress, paymentMethod, discountCode } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain items' });
  }

  if (!shippingAddress) {
    return res.status(400).json({ message: 'Shipping address is required' });
  }

  const products = await readData(PRODUCTS_FILE);
  const orders = await readData(ORDERS_FILE);

  let subtotal = 0;
  const orderItems = [];

  // Validate inventory, calculate server-side subtotal, and decrease stock levels
  for (const item of items) {
    const productIndex = products.findIndex(p => p.id === item.id);
    if (productIndex === -1) {
      return res.status(404).json({ message: `Product with ID ${item.id} not found` });
    }

    const product = products[productIndex];
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
    }

    // Deduct stock
    products[productIndex].stock -= item.quantity;
    
    subtotal += product.price * item.quantity;
    orderItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: item.quantity
    });
  }

  // Calculate taxes, shipping, discounts
  const shipping = subtotal > 150 ? 0 : 15.00; // Free shipping over $150
  const tax = subtotal * 0.08; // 8% sales tax
  let discount = 0;

  if (discountCode && discountCode.toUpperCase() === 'WELCOME10') {
    discount = subtotal * 0.10; // 10% discount code
  }

  const total = subtotal + tax + shipping - discount;

  const newOrder = {
    id: `order-${Date.now()}`,
    userId: req.user.id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    discountCode: discountCode || null,
    financials: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    },
    status: 'Processing',
    date: new Date().toISOString()
  };

  // Save updated products and new order
  orders.push(newOrder);
  await writeData(PRODUCTS_FILE, products);
  await writeData(ORDERS_FILE, orders);

  res.status(201).json({ message: 'Order placed successfully', order: newOrder });
});

// Get User's Order History
app.get('/api/orders', authenticateUser, async (req, res) => {
  const orders = await readData(ORDERS_FILE);
  const userOrders = orders.filter(o => o.userId === req.user.id);
  
  // Sort by date descending
  userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(userOrders);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
