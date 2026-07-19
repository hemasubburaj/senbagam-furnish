const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const orderItemSchema = new mongoose.Schema({
  slug: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer_name: { type: String, required: true, trim: true },
  customer_email: { type: String, required: true, trim: true, lowercase: true },
  customer_phone: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  items: { type: [orderItemSchema], required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  }
}, schemaOptions);

module.exports = mongoose.model('Order', orderSchema);