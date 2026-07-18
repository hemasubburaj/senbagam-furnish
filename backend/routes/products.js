const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products?category=Seating&featured=1&q=chair&type=Cot
router.get('/', async (req, res) => {
  try {
    const { category, featured, q, type } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (featured) filter.featured = true;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    const products = await Product.find(filter).sort({ created_at: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Could not load products.' });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.sort());
  } catch (err) {
    res.status(500).json({ error: 'Could not load categories.' });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Could not load product.' });
  }
});

module.exports = router;
