const express = require('express');
const router = express.Router();
const NewsletterSubscriber = require('../models/NewsletterSubscriber');

router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  try {
    await NewsletterSubscriber.create({ email: email.trim().toLowerCase() });
    res.status(201).json({ message: 'Subscribed. Thanks for joining.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ message: 'You are already subscribed.' });
    }
    res.status(500).json({ error: 'Could not subscribe right now.' });
  }
});

module.exports = router;
