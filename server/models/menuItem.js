const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  route: { type: String, default: '' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', default: null },
  order: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: false },
  // optional custom permission string; if not provided, consumer can derive from key
  permission: { type: String, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
