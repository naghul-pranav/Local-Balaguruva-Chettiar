// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: String,
  city: String,
  postalCode: String,
  wishlist: Array,
  cart: Array,
  resetPasswordOTP: { type: String },
  resetPasswordExpiry: { type: Date },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
