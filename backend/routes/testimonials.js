const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');

router.get('/', async (req, res) => {
  try {
    const rows = await Testimonial.find().sort({ created_at: -1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load testimonials.' });
  }
});

module.exports = router;
