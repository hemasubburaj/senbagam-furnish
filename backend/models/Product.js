const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

// For combo-type products: each slot represents one "piece" inside the
// package (e.g. Cot, Wardrobe, Sofa). `defaultSlug` points at the
// individual product shown by default; the storefront lets shoppers swap
// it for any other product of the same `optionType` (a narrow grouping
// like "Cot" or "Wardrobe" — NOT the broad Bedroom/Living Room/Pooja
// category, which would incorrectly offer a wardrobe as a cot swap).
const comboSlotSchema = new mongoose.Schema({
  slotLabel: { type: String, required: true },   // e.g. "Cot", "Wardrobe"
  optionType: { type: String, required: true },   // narrow group used to find valid swaps
  defaultSlug: { type: String, required: true }   // Product.slug shown by default
}, { _id: false });

const productSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },  // broad: Bedroom / Living Room / Pooja / Combos
  type: { type: String, trim: true },                       // narrow: Cot / Wardrobe / Sofa / etc — used for combo swaps
  material: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  compare_at_price: { type: Number, default: null },
  image: { type: String, required: true },
  featured: { type: Boolean, default: false },
  stock: { type: Number, default: 20 },
  comboItems: { type: [comboSlotSchema], default: undefined }
}, schemaOptions);

module.exports = mongoose.model('Product', productSchema);
