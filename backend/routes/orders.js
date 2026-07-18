const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');

// POST /api/orders  { customer_name, customer_email, customer_phone, address, items: [{slug, qty}] }
router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, address, items } = req.body;

    if (!customer_name || !customer_email || !customer_phone || !address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing customer details or an empty cart.' });
    }

    if (!/^\d{10}$/.test(customer_phone)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    let total = 0;
    const resolvedItems = [];

    for (const item of items) {
      const product = await Product.findOne({ slug: item.slug });
      if (!product) return res.status(400).json({ error: `Unknown product: ${item.slug}` });
      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      total += product.price * qty;
      resolvedItems.push({ slug: product.slug, name: product.name, price: product.price, qty });
    }

    const order = await Order.create({
      customer_name, customer_email, customer_phone, address,
      items: resolvedItems,
      total
    });

    res.status(201).json({
      orderId: order.id,
      total: Math.round(total * 100) / 100,
      items: resolvedItems,
      message: 'Order placed successfully.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not place order right now.' });
  }
});

// GET /api/orders/:id?email=customer@example.com
// (order tracking lookup — email required so a stranger can't view someone
// else's order just by guessing or sharing the order ID)
router.get('/:id', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to look up an order.' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'No order found with that ID and email.' });
    }
    const order = await Order.findById(req.params.id);
    if (!order || order.customer_email.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(404).json({ error: 'No order found with that ID and email.' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Could not load order.' });
  }
});

module.exports = router;