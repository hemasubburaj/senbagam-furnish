const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');

const VIEWS = path.join(__dirname, '..', 'admin-views');

// GET /admin/login — show login form (if already logged in, go straight to dashboard)
router.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/admin');
  res.sendFile(path.join(VIEWS, 'login.html'));
});

// POST /admin/login — check credentials
router.post('/login', express.urlencoded({ extended: true }), async (req, res) => {
  const { username, password } = req.body;
  const validUser = username === process.env.ADMIN_USERNAME;
  const validPass = validUser && await bcrypt.compare(password || '', process.env.ADMIN_PASSWORD_HASH || '');

  if (!validUser || !validPass) {
    return res.redirect('/admin/login?error=1');
  }

  req.session.isAdmin = true;
  res.redirect('/admin');
});

// POST /admin/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// GET /admin — protected dashboard shell (data loads client-side from /api/admin/*)
router.get('/', requireAdmin, (req, res) => {
  res.sendFile(path.join(VIEWS, 'dashboard.html'));
});

module.exports = router;
