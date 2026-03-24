const mongoose = require('mongoose');

// MenuItem schema (leaf items inside a menu)
const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

// Menu schema with self-referencing for nested sub-menus
const MenuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', default: null },
  items: [MenuItemSchema],
  order: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Menu', MenuSchema);
