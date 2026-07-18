const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true }
}, schemaOptions);

module.exports = mongoose.model('NewsletterSubscriber', subscriberSchema);
