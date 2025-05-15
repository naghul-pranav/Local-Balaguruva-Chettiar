const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  description: { type: String },
  category: { type: String },
  addedAt: { type: Date, default: Date.now }
});

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String },
  mrp: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const deletedUserSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, trim: true },
  email: { type: String, required: true, trim: true, index: true },
  password: { type: String }, // Optional, for audit purposes
  googleId: { type: String }, // Optional, for Google-authenticated users
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  postalCode: { type: String, trim: true },
  profileImage: { type: String },
  lastLogin: { type: Date },
  preferences: {
    notifications: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: false }
  },
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  wishlist: [wishlistItemSchema],
  cart: [cartItemSchema],
  lastUpdated: { type: Date },
  deletedAt: { type: Date, default: Date.now, index: true }
});

// Ensure indexes for efficient queries
deletedUserSchema.index({ deletedAt: 1 });

module.exports = mongoose.models.DeletedUser || mongoose.model("DeletedUser", deletedUserSchema);