const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are all required.' });
  }
  try {
    await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim()
    });
    res.status(201).json({ message: 'Message sent. We will get back to you soon.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not send message right now.' });
  }
});

module.exports = router;
