function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();

  // API calls get JSON 401, page requests get redirected to login
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({ error: 'Admin login required.' });
  }
  return res.redirect('/admin/login');
}

module.exports = requireAdmin;
