const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const DeletedUser = require('./models/DeletedUser');
const userRoutes = require('./routes/userRoutes');
const accountRoutes = require('./routes/account');
const User = require('./models/User');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 5008;
const Cart = require('./models/Cart');

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(cors());

// MongoDB Connection
const MONGO_URI = "mongodb+srv://balaguruva-admin:Balaguruva%401@balaguruvacluster.d48xg.mongodb.net/?retryWrites=true&w=majority&appName=BalaguruvaCluster";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
  phone: { type: String },
  address: { type: String },
  city: { type: String },              
  postalCode: { type: String },        
  profileImage: { type: String },
  lastLogin: { type: Date, default: Date.now },
  preferences: {
    notifications: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: false }
  },
  orderHistory: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  }],
  wishlist: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    description: { type: String },
    category: { type: String },
    addedAt: { type: Date, default: Date.now }
  }],
  lastUpdated: { type: Date }
});


// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now, expires: "7d" }
}, { timestamps: true });

const Contact = mongoose.model("Contact", contactSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Allow guest checkout
  },
  userEmail: { type: String, required: true },
  userName: { type: String, required: false, default: "Guest User" },
  orderItems: [{
    name: { type: String, required: true },
    mrp: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String }
  }],
  
  shippingInfo: {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  deliveryMethod: { 
    type: String, 
    required: true,
    enum: ['standard', 'express'] 
  },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['razorpay', 'cod', 'upi'] // Add 'upi' here
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  subtotal: { type: Number, required: true },
  deliveryPrice: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true },
  orderStatus: {
    type: String, 
    required: true,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  orderReference: { type: String, required: true, unique: true },
  notes: { type: String }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
// Add this product schema first
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  mrp: { type: Number, required: true },
  discount: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  category: { type: String },
  image: { type: String },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", productSchema);
// Cart Schema
const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: String,
      image: String,
      mrp: Number,
      discountedPrice: Number,
      quantity: Number,
    },
  ],
});

// Archived Product Schema
const archivedProductSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  mrp: { type: Number, required: true },
  discount: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  category: { type: String },
  image: { type: String },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date },
  archivedAt: { type: Date, default: Date.now }
});

const ArchivedProduct = mongoose.model("ArchivedProduct", archivedProductSchema);

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(`Auth Header for ${req.path}:`, authHeader); // Debug header

  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log(`No token provided for ${req.path}`);
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  console.log(`Token received: ${token}`); // Debug token

  try {
    const verified = jwt.verify(token, "4953546c308be3088b28807c767bd35e99818434d130a588e5e6d90b6d1d326e");
    console.log(`Token verified for user:`, verified); // Debug verified payload
    req.user = verified;
    next();
  } catch (error) {
    console.error(`Token verification error for ${req.path}:`, error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token. Please log in again." });
    }
    res.status(500).json({ message: "Internal server error during token verification." });
  }
};

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'contact.balaguruvachettiarsons@gmail.com',
    pass: 'bwob nzqz rauc tdlh'
  }
});

async function migrateCartProductIds() {
  const carts = await Cart.find();
  for (const cart of carts) {
    for (const item of cart.items) {
      if (typeof item.productId === "string") {
        try {
          item.productId = mongoose.Types.ObjectId(item.productId);
        } catch (err) {
          console.error(`Invalid ObjectId for productId: ${item.productId}`);
          // Optionally remove invalid items
          cart.items = cart.items.filter((i) => i.productId !== item.productId);
        }
      }
    }
    await cart.save();
  }
  console.log("Migration complete");
}

app.get("/api/migrate-carts", async (req, res) => {
  await migrateCartProductIds();
  res.json({ message: "Migration complete" });
});
// Send verification code
app.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

  try {
    await transporter.sendMail({
      from: '"K.Balaguruva Chettiar Sons Co" <contact.balaguruvachettiarsons@gmail.com>',
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}`,
      html: `<p>Your verification code is: <strong>${code}</strong></p>`,
    });
    res.json({ message: 'Verification code sent', code }); // Send code for simplicity (in prod, store in DB)
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
});

// Forgot Password - Send OTP
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user logs in with Google, they don't have a password to reset
    if (!user.password) {
      return res.status(400).json({ message: 'This account uses Google login and cannot reset a password' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Store OTP and expiry in user document temporarily
    user.resetPasswordOTP = otp;
    user.resetPasswordExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    await transporter.sendMail({
      from: '"K.Balaguruva Chettiar Sons Co" <contact.balaguruvachettiarsons@gmail.com>',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
    });

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP', details: error.message });
  }
});

// Reset Password - Verify OTP and Update Password
app.post('/api/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify OTP and expiry
    if (user.resetPasswordOTP !== otp || user.resetPasswordExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined; // Clear OTP
    user.resetPasswordExpiry = undefined; // Clear expiry
    user.lastUpdated = new Date();
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password', details: error.message });
  }
});
// Login Endpoint
app.post("/login", async (req, res) => {
  const { email, password, googleId, name } = req.body;
  try {
    let user = await User.findOne({ email });

    if (googleId) {
      if (!user) user = await User.create({ email, googleId, name });
      else if (user.googleId && user.googleId !== googleId) return res.status(400).json({ message: "This email is registered with a different Google ID" });
      const token = jwt.sign({ id: user._id, email: user.email }, "4953546c308be3088b28807c767bd35e99818434d130a588e5e6d90b6d1d326e", { expiresIn: "1h" });
      return res.json({ user, token });
    } else {
      if (!user) return res.status(400).json({ message: "User not found" });
      if (!user.password) return res.status(400).json({ message: "This account uses Google login" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
      const token = jwt.sign({ id: user._id, email: user.email }, "4953546c308be3088b28807c767bd35e99818434d130a588e5e6d90b6d1d326e", { expiresIn: "1h" });
      return res.json({ user, token });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Signup Endpoint
app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (await User.findOne({ email })) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });
    const token = jwt.sign({ id: user._id, email: user.email }, "4953546c308be3088b28807c767bd35e99818434d130a588e5e6d90b6d1d326e", { expiresIn: "1h" });
    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Contact Form Endpoint
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const newContact = new Contact({ name, email, phone, subject, message });
    const validationError = newContact.validateSync();
    if (validationError) return res.status(400).json({ error: "Validation failed", details: validationError.message });
    const savedContact = await newContact.save();
    res.status(201).json({ message: "Contact saved successfully", id: savedContact._id });
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ error: "Failed to save contact", details: error.message });
  }
});

// Test DB Endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const connectionState = { readyState: mongoose.connection.readyState, status: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown" };
    res.status(200).json({ message: "DB connection test", connection: connectionState });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Product and Remove from Wishlists
app.delete("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Move product to archivedproducts
    await ArchivedProduct.create({
      originalId: product._id,
      name: product.name,
      description: product.description,
      mrp: product.mrp,
      discount: product.discount,
      discountedPrice: product.discountedPrice,
      category: product.category,
      image: product.image,
      stock: product.stock,
      createdAt: product.createdAt,
      archivedAt: new Date()
    });

    // Delete product from active products
    await Product.findByIdAndDelete(productId);

    // Remove product from all users' wishlists
    await User.updateMany(
      { 'wishlist.productId': productId },
      { $pull: { wishlist: { productId } } }
    );

    // Remove product from all carts
    await Cart.updateMany(
      { 'items.productId': productId },
      { $pull: { items: { productId } } }
    );

    res.status(200).json({ message: "Product deleted and removed from wishlists and carts" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Restore Product from Archived
app.post("/api/products/restore/:id", authenticateToken, async (req, res) => {
  try {
    const archivedProduct = await ArchivedProduct.findById(req.params.id);
    if (!archivedProduct) {
      return res.status(404).json({ message: "Archived product not found" });
    }

    // Recreate the product in the active products collection
    const restoredProduct = await Product.create({
      name: archivedProduct.name,
      description: archivedProduct.description,
      mrp: archivedProduct.mrp,
      discount: archivedProduct.discount,
      discountedPrice: archivedProduct.discountedPrice,
      category: archivedProduct.category,
      image: archivedProduct.image,
      stock: archivedProduct.stock,
      createdAt: archivedProduct.createdAt
    });

    // Delete from archived products
    await ArchivedProduct.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Product restored successfully", product: restoredProduct });
  } catch (error) {
    console.error("Error restoring product:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Profile
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update User Profile
app.put("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const { name, phone, address, city, postalCode, preferences, profileImage } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;
    if (postalCode) user.postalCode = postalCode;
    if (preferences) user.preferences = preferences;
    if (profileImage) user.profileImage = profileImage;
    
    // Add last update timestamp
    user.lastUpdated = new Date();
    
    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Password Change Endpoint
app.put("/api/user/password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // If user logs in with Google, they don't have a password
    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google for authentication" });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
    
    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.lastUpdated = new Date();
    
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Account Deletion Endpoint
// Specific routes
app.delete("/api/user/account", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch the user's cart
    const cart = await Cart.findOne({ userId: user.email });

    // Save user data to DeletedUser collection
    await DeletedUser.create({
      originalId: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      googleId: user.googleId,
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      profileImage: user.profileImage,
      lastLogin: user.lastLogin,
      preferences: user.preferences,
      orderHistory: user.orderHistory,
      wishlist: user.wishlist,
      cart: cart ? cart.items : [], // Include cart items
      lastUpdated: user.lastUpdated,
      deletedAt: new Date()
    });

    // Clean up related data
    await Cart.deleteOne({ userId: user.email });
    await Order.updateMany({ user: user._id }, { $unset: { user: "" } });

    // Delete the user
    await User.deleteOne({ _id: req.user.id });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route middleware
app.use('/api/user', userRoutes);
app.use('/api/user', accountRoutes);

// User Data Export Endpoint
app.get("/api/user/export", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Create user data export
    const userData = {
      profile: user.toObject(),
      exportDate: new Date(),
      exportedBy: req.user.id,
    };
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=user_data_${new Date().toISOString().split('T')[0]}.json`);
    
    res.json(userData);
  } catch (error) {
    console.error("Error exporting user data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Authentication Status Endpoint
app.get("/api/auth/status", authenticateToken, (req, res) => {
  res.json({ 
    authenticated: true, 
    userId: req.user.id,
    email: req.user.email,
    lastVerified: new Date()
  });
});

// Create New Order Endpoint
app.post("/api/orders", async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      orderItems,
      shippingInfo,
      deliveryMethod,
      paymentMethod,
      paymentResult,
      subtotal,
      deliveryPrice,
      totalPrice,
      orderReference,
      notes,
    } = req.body;

    // Validate required fields
    if (!userEmail || !orderItems || !shippingInfo || !deliveryMethod || !paymentMethod || !subtotal || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        details: "Please provide all necessary order information",
      });
    }

    // Start MongoDB transaction
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // Validate stock for each item
      for (const item of orderItems) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
      }

      // Generate a unique order reference if not provided
      const finalOrderReference = orderReference || `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      // Check if userId is valid or find user by email
      let validatedUserId = null;
      let userFound = false;

      if (userId) {
        const userExists = await User.findById(userId).session(session);
        if (userExists) {
          validatedUserId = userId;
          userFound = true;
        }
      }

      if (!userFound && userEmail) {
        const userByEmail = await User.findOne({ email: userEmail }).session(session);
        if (userByEmail) {
          validatedUserId = userByEmail._id;
          userFound = true;
        }
      }

      // Create new order
      const newOrder = new Order({
        user: validatedUserId,
        userEmail,
        userName: userName || (validatedUserId ? "Registered User" : "Guest User"),
        orderItems: orderItems.map((item) => ({
          name: item.name,
          mrp: item.mrp || item.price,
          discountedPrice: item.discountedPrice || item.price,
          quantity: item.quantity,
          image: item.image || "",
          productId: item.productId, // Ensure productId is included
        })),
        shippingInfo,
        deliveryMethod,
        paymentMethod,
        paymentResult: paymentResult || undefined,
        notes: notes || "",
        subtotal,
        deliveryPrice: deliveryPrice || 0,
        totalPrice,
        orderReference: finalOrderReference,
        orderStatus: "processing",
      });

      // Handle payment status
      if (paymentResult) {
        newOrder.paymentResult = {
          id: paymentResult.id || "",
          status: paymentResult.status || "pending",
          update_time: paymentResult.update_time || new Date().toISOString(),
          email_address: paymentResult.email_address || userEmail,
        };
        newOrder.paymentStatus = paymentResult.status === "success" ? "completed" : paymentResult.status === "failed" ? "failed" : "pending";
      } else {
        newOrder.paymentStatus = paymentMethod === "cod" || paymentMethod === "upi" ? "pending" : "failed";
      }

      // Save order
      const savedOrder = await newOrder.save({ session });

      // Update stock for each item
      for (const item of orderItems) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }

      // Update user order history
      if (validatedUserId) {
        await User.findByIdAndUpdate(
          validatedUserId,
          {
            $push: { orderHistory: savedOrder._id },
            lastUpdated: new Date(),
          },
          { session }
        );
      }

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order: savedOrder,
        orderReference: savedOrder.orderReference,
      });
    });

    session.endSession();
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
});

// Get Order by ID
app.get("/api/orders/:id", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if the order belongs to the authenticated user
    if (order.user && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to access this order" });
    }
    
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get User's Orders - Enhanced to include both ID and email-based lookups
app.get("/api/my-orders", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // If the user has orderHistory field with populated orders, use that first
    if (user.orderHistory && user.orderHistory.length > 0) {
      const populatedUser = await User.findById(req.user.id)
        .select('orderHistory')
        .populate({
          path: 'orderHistory',
          options: { sort: { createdAt: -1 } }
        });
      
      console.log(`Found ${populatedUser.orderHistory.length} orders in user's orderHistory`);
      
      return res.json({
        success: true,
        orders: populatedUser.orderHistory,
        message: "Orders retrieved from order history"
      });
    }
    
    // Fallback: Find orders by user ID or matching email
    const userOrders = await Order.find({ 
      $or: [
        { user: req.user.id },
        { userEmail: user.email }
      ]
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${userOrders.length} orders by ID/email lookup`);
    
    // If we found orders, also update the user's orderHistory for future
    if (userOrders.length > 0) {
      try {
        // Update the user's orderHistory with these order IDs
        const orderIds = userOrders.map(order => order._id);
        await User.findByIdAndUpdate(
          req.user.id,
          { 
            orderHistory: orderIds,
            lastUpdated: new Date()
          }
        );
        console.log("Updated user's orderHistory with found orders");
      } catch (updateError) {
        console.error("Failed to update orderHistory:", updateError);
      }
    }
    
    if (userOrders.length === 0) {
      return res.status(200).json({
        success: true,
        orders: [],
        message: "No orders found for this user"
      });
    }
    
    return res.json({
      success: true,
      orders: userOrders,
      message: "Orders retrieved by ID and email lookup"
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch orders. Please try again later.",
      error: error.message
    });
  }
});

// Update Order Status Endpoint
app.put("/api/orders/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Status is required" 
      });
    }
    
    // Validate status value
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status value" 
      });
    }
    
    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }
    
    // Update order status
    order.orderStatus = status;
    
    // Set payment status to completed if order is delivered and payment was pending
    if (status === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'pending') {
      order.paymentStatus = 'completed';
    }
    
    // If order is cancelled and payment was completed, we might want to handle refund logic here
    
    await order.save();
    
    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        _id: order._id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update order status", 
      error: error.message 
    });
  }
});

// Get User's Wishlist
app.get("/api/user/wishlist", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({
      success: true,
      wishlist: user.wishlist || []
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/cart/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching cart for userId:", userId);
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items.length) {
      console.log("No cart found or empty cart for userId:", userId);
      return res.status(200).json({ items: [] });
    }

    // Transform cart items, filtering out invalid items
    const transformedItems = cart.items
      .map((item, index) => {
        if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
          console.warn(`Invalid or missing productId at cart.items[${index}]:`, item);
          return null;
        }
        return {
          productId: item.productId.toString(),
          name: item.name,
          image: item.image,
          mrp: item.mrp,
          discountedPrice: item.discountedPrice,
          quantity: item.quantity,
        };
      })
      .filter((item) => item !== null);

    console.log(`Returning ${transformedItems.length} valid cart items for userId:`, userId);
    res.status(200).json({ items: transformedItems });
  } catch (err) {
    console.error("Error fetching cart:", err.message, err.stack);
    res.status(500).json({ message: "Failed to fetch cart", details: err.message });
  }
});

// Add to Cart - Smart Handling (Merge if Exists)

app.post("/api/cart/add", authenticateToken, async (req, res) => {
  try {
    const { userId, product } = req.body;
    if (!userId || !product?.productId || !product.quantity) {
      console.error("Missing required fields:", { userId, product });
      return res.status(400).json({ message: "Missing userId, productId, or quantity" });
    }

    // Validate productId as ObjectId
    if (!mongoose.Types.ObjectId.isValid(product.productId)) {
      console.error("Invalid productId:", product.productId);
      return res.status(400).json({ message: "Invalid productId format" });
    }

    // Validate product and stock
    const productData = await Product.findById(product.productId);
    if (!productData) {
      console.error("Product not found for productId:", product.productId);
      return res.status(404).json({ message: "Product not found" });
    }
    if (productData.stock < product.quantity) {
      return res.status(400).json({ message: `Only ${productData.stock} units available` });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check for existing item
    const incomingId = product.productId;
    console.log("Checking for productId in cart:", incomingId);
    const existingIndex = cart.items.findIndex(
      (item) => item.productId && String(item.productId) === String(incomingId)
    );

    if (existingIndex !== -1) {
      // Item exists, update quantity
      const newQuantity = cart.items[existingIndex].quantity + product.quantity;
      if (newQuantity > productData.stock) {
        return res.status(400).json({ message: `Only ${productData.stock} units available` });
      }
      cart.items[existingIndex].quantity = newQuantity;
      console.log(`Updated quantity for product ${incomingId} to ${newQuantity}`);
    }else {
  // New item, add to cart
  const newItem = {
    productId: new mongoose.Types.ObjectId(product.productId),
    name: product.name || productData.name || "Unknown Product",
    image: product.image || productData.image || "", // Ensure image is included
    mrp: product.mrp || productData.mrp || 0,
    discountedPrice: product.discountedPrice || productData.discountedPrice || 0,
    quantity: product.quantity || 1,
  };
  cart.items.push(newItem);
  console.log(`Added new product ${incomingId} to cart with image:`, newItem.image ? newItem.image.substring(0, 50) : "MISSING");
}

    await cart.save();
    console.log("Cart saved successfully for user:", userId);
    return res.status(200).json({ message: "Cart updated", cart });
  } catch (err) {
    console.error("Cart add error:", err.message, err.stack);
    res.status(500).json({ message: "Server error while adding to cart", details: err.message });
  }
});

app.post("/api/cart/update", authenticateToken, async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    console.log("Updating cart for userId:", userId, "productId:", productId, "quantity:", quantity);

    if (!userId || !productId || quantity < 1) {
      return res.status(400).json({ message: "Invalid request: userId, productId, and quantity are required" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => String(item.productId) === String(productId));
    if (itemIndex === -1) {
      console.warn("Item not found in cart for productId:", productId);
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const productData = await Product.findById(productId);
    if (!productData) {
      console.warn("Product not found for productId:", productId);
      return res.status(404).json({ message: "Product not found" });
    }
    if (quantity > productData.stock) {
      return res.status(400).json({ message: `Only ${productData.stock} units available` });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    console.log(`Updated quantity for product ${productId} to ${quantity}`);

    res.status(200).json({ message: "Cart updated successfully" });
  } catch (err) {
    console.error("Error updating cart:", err.message);
    res.status(500).json({ message: "Failed to update cart", details: err.message });
  }
});
 
app.post("/api/cart/remove", authenticateToken, async (req, res) => {
  try {
    const { userId, productId } = req.body;
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter(
      (item) => String(item.productId) !== String(productId)
    );
    await cart.save();
    return res.status(200).json({ message: "Item removed", cart });
  } catch (err) {
    console.error("Cart remove error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await Cart.findOneAndDelete({ userId });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart", details: err.message });
  }
});

// Add Item to Wishlist
app.post("/api/user/wishlist", authenticateToken, async (req, res) => {
  try {
    const { productId, name, price, image, description, category } = req.body;
    
    if (!productId || !name || price === undefined) {
      return res.status(400).json({ message: "Missing required product information" });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Check if item already exists in wishlist
    const existingItem = user.wishlist.find(item => item.productId === productId);
    if (existingItem) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }
    
    // Add new item to wishlist
    user.wishlist.push({
      productId,
      name,
      price,
      image,
      description,
      category,
      addedAt: new Date()
    });
    
    user.lastUpdated = new Date();
    await user.save();
    
    res.status(201).json({
      success: true,
      message: "Item added to wishlist",
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove Item from Wishlist
app.delete('/api/user/wishlist/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the product exists in the wishlist
    const wishlistItemIndex = user.wishlist.findIndex(item => item.productId.toString() === productId);
    if (wishlistItemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    // Remove the product from the wishlist
    user.wishlist.splice(wishlistItemIndex, 1);

    // Save the user document, disabling versioning to avoid VersionError
    await user.save({ versionKey: false });

    res.status(200).json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error while removing from wishlist' });
  }
});
// Clear Entire Wishlist
app.delete('/api/user/wishlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear the wishlist
    user.wishlist = [];
    user.lastUpdated = new Date();

    // Save the user document, disabling versioning to avoid VersionError
    await user.save({ versionKey: false });

    res.status(200).json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Server error while clearing wishlist' });
  }
});
// Clear Entire Wishlist
app.post('/api/user/wishlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, name, price, image, description, category } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if product already exists in wishlist
    const exists = user.wishlist.some(item => item.productId.toString() === productId);
    if (exists) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    // Add product to wishlist
    user.wishlist.push({ productId, name, price, image, description, category });

    // Save the user document, disabling versioning
    await user.save({ versionKey: false });

    res.status(200).json({ message: 'Product added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error while adding to wishlist' });
  }
});
// Fetch all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    // Transform products to include id as _id string and necessary fields
    const transformedProducts = products.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      mrp: product.mrp,
      discount: product.discount,
      discountedPrice: product.discountedPrice,
      category: product.category,
      image: product.image,
      stock: product.stock,
      createdAt: product.createdAt,
      isNew: (Date.now() - product.createdAt) < 7 * 24 * 60 * 60 * 1000 // Mark as new if created within 7 days
    }));
    res.status(200).json(transformedProducts);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products", details: err.message });
  }
});
// DELETE a product from user's cart
// Get Single Product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product is archived
    if (product.isArchived) {
      return res.status(410).json({ message: "Product is archived" });
    }

    // Transform the product to match the frontend's expected format
    const transformedProduct = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      mrp: product.mrp,
      discount: product.discount,
      discountedPrice: product.discountedPrice,
      category: product.category,
      image: product.image,
      stock: product.stock,
      createdAt: product.createdAt,
      isNew: (Date.now() - product.createdAt) < 7 * 24 * 60 * 60 * 1000
    };

    res.status(200).json(transformedProduct);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product", details: err.message });
  }
});

app.use("/api/cart", require("./routes/cart"));

// Start Server
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));