const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  quote: { type: String, required: true },
  rating: { type: Number, default: 5, min: 1, max: 5 }
}, schemaOptions);

module.exports = mongoose.model('Testimonial', testimonialSchema);
