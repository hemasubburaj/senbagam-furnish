const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, required: true }
}, schemaOptions);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
