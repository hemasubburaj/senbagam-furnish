const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const ContactMessage = require('../models/ContactMessage');
const requireAdmin = require('../middleware/requireAdmin');

router.use(requireAdmin);

/* ---------- products (full CRUD) ---------- */
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ created_at: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Could not load products.' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { slug, name, category, material, description, price, compare_at_price, image, featured, stock } = req.body;
    if (!slug || !name || !category || !material || !description || price == null) {
      return res.status(400).json({ error: 'Missing required product fields.' });
    }
    const product = await Product.create({
      slug, name, category, material, description, price,
      compare_at_price: compare_at_price || null,
      image: image || '/images/products/placeholder.svg',
      featured: !!featured,
      stock: stock ?? 20
    });
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'A product with that slug already exists.' });
    res.status(500).json({ error: 'Could not create product.' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Product not found.' });
    const updates = { ...req.body };
    if ('featured' in updates) updates.featured = !!updates.featured;
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(product);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'A product with that slug already exists.' });
    res.status(500).json({ error: 'Could not update product.' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Product not found.' });
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete product.' });
  }
});

/* ---------- orders (read + status update) ---------- */
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Could not load orders.' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Order not found.' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json({ message: 'Status updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not update order status.' });
  }
});

/* ---------- newsletter subscribers (read only) ---------- */
router.get('/newsletter', async (req, res) => {
  try {
    const rows = await NewsletterSubscriber.find().sort({ created_at: -1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load subscribers.' });
  }
});

/* ---------- contact messages (read only) ---------- */
router.get('/messages', async (req, res) => {
  try {
    const rows = await ContactMessage.find().sort({ created_at: -1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load messages.' });
  }
});

/* ---------- quick stats for dashboard header ---------- */
router.get('/stats', async (req, res) => {
  try {
    const [productCount, orderCount, subscriberCount, revenueAgg] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      NewsletterSubscriber.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }])
    ]);
    res.json({
      productCount,
      orderCount,
      subscriberCount,
      revenue: revenueAgg[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not load stats.' });
  }
});

module.exports = router;
