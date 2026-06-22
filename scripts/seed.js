require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/user');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const Cart = require('../src/models/cart');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydb';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to', MONGO_URI);

    // Clear collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('adminpass', 10),
      role: 'admin'
    });

    const merchant = await User.create({
      name: 'Merchant One',
      email: 'merchant@example.com',
      password: await bcrypt.hash('merchantpass', 10),
      role: 'merchant'
    });

    const customer = await User.create({
      name: 'Customer One',
      email: 'customer@example.com',
      password: await bcrypt.hash('customerpass', 10),
      role: 'customer'
    });

    // Create products
    const prod1 = await Product.create({
      merchant: merchant._id,
      name: 'Sample Product 1',
      description: 'Tasty sample',
      price: 9.99,
      category: 'food'
    });

    const prod2 = await Product.create({
      merchant: merchant._id,
      name: 'Sample Product 2',
      description: 'Another sample',
      price: 5.5,
      category: 'snack'
    });

    // Create cart for customer
    await Cart.create({
      customer: customer._id,
      items: [
        { product: prod1._id, quantity: 2 },
        { product: prod2._id, quantity: 1 }
      ]
    });

    // Create an order
    await Order.create({
      customer: customer._id,
      merchant: merchant._id,
      items: [
        { product: prod1._id, quantity: 2, price: prod1.price },
        { product: prod2._id, quantity: 1, price: prod2.price }
      ],
      totalAmount: (prod1.price * 2) + prod2.price,
      orderStatus: 'placed'
    });

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error', err);
    process.exit(1);
  }
}

seed();
