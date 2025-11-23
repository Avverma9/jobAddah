const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  route: { type: String, default: '' },
  // icon: a string that identifies the icon (font class, svg name, or URL)
  icon: { type: String, default: null },
  // iconType helps the frontend decide how to render the icon
  // possible values: 'font' (e.g., fontawesome class), 'svg' (named svg), 'img' (image URL)
  iconType: { type: String, enum: ['font','svg','img','none'], default: 'font' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', default: null },
  order: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: false },
  // optional badge text shown alongside the menu item (e.g., New, 5)
  badge: { type: String, default: null },
  // optional free-form metadata (icons, perms, ui hints)
  meta: { type: Object, default: {} },
  // optional custom permission string; if not provided, consumer can derive from key
  permission: { type: String, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
