const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Recompute the total server-side from real product prices — never trust
// a total sent from the browser.
async function computeTotal(items) {
  let total = 0;
  const resolvedItems = [];
  for (const item of items) {
    const product = await Product.findOne({ slug: item.slug });
    if (!product) throw new Error(`Unknown product: ${item.slug}`);
    const qty = Math.max(1, parseInt(item.qty, 10) || 1);
    total += product.price * qty;
    resolvedItems.push({ slug: product.slug, name: product.name, price: product.price, qty });
  }
  return { total, resolvedItems };
}

// POST /api/payment/create-order  { items: [{slug, qty}] }
// Creates a Razorpay order for the cart's real (server-computed) total.
router.post('/create-order', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    const { total } = await computeTotal(items);
    const amountInPaise = Math.round(total * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not start payment.' });
  }
});

// POST /api/payment/verify
// { razorpay_order_id, razorpay_payment_id, razorpay_signature,
//   customer_name, customer_email, customer_phone, address, items }
// Verifies the payment signature, then creates the real Order record.
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      customer_name, customer_email, customer_phone, address, items
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details.' });
    }
    if (!customer_name || !customer_email || !customer_phone || !address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing customer details or an empty cart.' });
    }
    if (!/^\d{10}$/.test(customer_phone)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    // Verify the signature Razorpay sent back actually matches this order —
    // this is what proves the payment is genuine and wasn't forged client-side.
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed.' });
    }

    const { total, resolvedItems } = await computeTotal(items);

    const order = await Order.create({
      customer_name, customer_email, customer_phone, address,
      items: resolvedItems,
      total,
      status: 'processing',
      razorpay_order_id,
      razorpay_payment_id,
      payment_status: 'paid'
    });

    res.status(201).json({
      orderId: order.id,
      total: Math.round(total * 100) / 100,
      items: resolvedItems,
      message: 'Payment verified and order placed successfully.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not verify payment.' });
  }
});

module.exports = router;