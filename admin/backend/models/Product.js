const mongoose = require('mongoose');

// Counter schema for auto-incrementing IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model("Counter", counterSchema);

// Product schema with validation
const productSchema = new mongoose.Schema({
  id: { 
    type: Number, 
    unique: true 
    // Removed required: true to match the older version
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  mrp: { type: Number, required: true, min: 0 },
  discount: { type: Number, required: true, min: 0, max: 100 },
  discountedPrice: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  stock: { type: Number, required: true, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save middleware for auto-incrementing product ID
productSchema.pre('save', async function(next) {
  console.log(`Pre-save middleware triggered for product: ${this.name}. isNew: ${this.isNew}`);
  if (!this.isNew) {
    console.log("Document is not new, skipping ID assignment.");
    return next();
  }

  try {
    console.log("Attempting to increment counter for product ID...");
    const counter = await Counter.findByIdAndUpdate(
      "productId",
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    console.log(`Counter result: ${JSON.stringify(counter)}`);
    if (!counter || typeof counter.seq !== 'number') {
      console.error("Counter operation failed or returned invalid seq.");
      throw new Error("Failed to generate a valid product ID");
    }

    this.id = counter.seq;
    console.log(`Assigned product ID: ${this.id} to product: ${this.name}`);
    next();
  } catch (error) {
    console.error("Error in pre-save middleware:", error);
    next(error);
  }
});

// Verify middleware registration
console.log("Pre-save middleware registered for Product schema in Product.js.");

// Export both the Product model and the Counter model
module.exports = {
  Product: mongoose.model("Products", productSchema),
  Counter
};