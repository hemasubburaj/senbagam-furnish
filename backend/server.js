require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const connectDB = require('./db/connect');
const productsRouter = require('./routes/products');
const testimonialsRouter = require('./routes/testimonials');
const newsletterRouter = require('./routes/newsletter');
const contactRouter = require('./routes/contact');
const ordersRouter = require('./routes/orders');
const paymentRouter = require('./routes/payment');
const adminRouter = require('./routes/admin');
const adminApiRouter = require('./routes/adminApi');


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
    sameSite: 'lax'
  }
}));

// --- Admin (session-protected, not linked from public nav) ---
app.use('/admin', adminRouter);
app.use('/api/admin', adminApiRouter);

// --- Public API routes ---
app.use('/api/products', productsRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/contact', contactRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payment', paymentRouter);


app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// --- Static frontend ---
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

app.use((req, res) => {
  res.status(404).sendFile(path.join(FRONTEND_DIR, '404.html'));
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Furnish server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });