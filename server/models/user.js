const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const roles = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(roles), default: roles.USER },
  // permissions is an array of strings representing menu items or actions the user is allowed to see/do
  permissions: { type: [String], default: [] },
  // banned flag - when true the user should be prevented from performing actions or logging in
  banned: { type: Boolean, default: false }
}, { timestamps: true });

// Security pin for password reset
userSchema.add({
  securityPin: { type: String, default: null },
  securityPinExpires: { type: Date, default: null }
});

// Generate an alphanumeric security pin of given length and set expiry (days)
userSchema.methods.setSecurityPin = function(length = 15, daysValid = 7) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let pin = '';
  for (let i = 0; i < length; i++) pin += chars.charAt(Math.floor(Math.random() * chars.length));
  this.securityPin = pin;
  this.securityPinExpires = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);
  return pin;
};

userSchema.methods.clearSecurityPin = function() {
  this.securityPin = null;
  this.securityPinExpires = null;
};

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.statics.roles = roles;

module.exports = mongoose.model('User', userSchema);
