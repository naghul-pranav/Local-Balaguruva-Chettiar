const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const User = require('./models/User');
const ProductModule = require('./models/Product'); // Import the module directly for debugging
const app = express();
const PORT = 5000;
const jwt = require("jsonwebtoken");
const MONGO_URI = "mongodb+srv://balaguruva-admin:Balaguruva%401@balaguruvacluster.d48xg.mongodb.net/?retryWrites=true&w=majority&appName=BalaguruvaCluster";
const nodemailer = require('nodemailer');

// Log Mongoose version
console.log(`Mongoose version: ${mongoose.version}`);

// Debug the raw import
console.log("Raw ProductModule:", ProductModule);

// Destructure after logging
const { Product, Counter } = ProductModule || {};
console.log("Imported Product:", Product);
console.log("Imported Counter:", Counter);

// Middleware
app.use(cors());
app.use(express.json());

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'contact.balaguruvachettiarsons@gmail.com',
    pass: 'bwob nzqz rauc tdlh'
  }
});

// Helper function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTPs temporarily (in production, use Redis or a database)
const otpStore = new Map();

// Cart schema with productId validation
const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [{
    productId: {
      type: String,
      required: true,
      validate: {
        validator: async function (value) {
          const product = await Product.findById(value);
          return !!product;
        },
        message: 'Product does not exist'
      }
    },
    quantity: { type: Number, required: true, min: 1 },
  }],
});

const Cart = mongoose.model("Cart", cartSchema);

// Contact schema
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

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priority: { 
    type: String, 
    required: true, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  due: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", taskSchema);

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
    enum: ['razorpay', 'cod', 'upi']
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

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Function to initialize the counter
const initializeCounter = async () => {
  try {
    if (!Product) {
      throw new Error("Product model is undefined. Check the import from './models/Product'.");
    }
    const lastProduct = await Product.findOne({}).sort({ id: -1 });
    const maxId = lastProduct ? lastProduct.id : 0;
    await Counter.findByIdAndUpdate(
      "productId",
      { seq: maxId },
      { upsert: true, new: true }
    );
    console.log(`✅ Counter set to ${maxId}`);

    // Drop the existing index (if any) and create a new unique index on id
    try {
      await mongoose.connection.collection("products").dropIndex("id_1");
      console.log("✅ Dropped existing index");
    } catch (error) {
      console.log("No existing index to drop");
    }
    await Product.collection.createIndex({ id: 1 }, { unique: true });
    console.log("✅ Created new unique index");
  } catch (err) {
    console.error("❌ Counter Initialization Error:", err);
  }
};

// Multer configuration for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  }
});

// Helper function to format the product response
const formatProduct = (product) => ({
  id: product.id,
  _id: product._id,
  name: product.name,
  description: product.description,
  mrp: product.mrp,
  discount: product.discount,
  discountedPrice: product.discountedPrice,
  category: product.category,
  image: `data:image/png;base64,${product.image}`,
  stock: product.stock,
  createdAt: product.createdAt
});

// Helper function to format user response
const formatUser = (user) => {
  const { password, __v, ...userData } = user.toObject(); // Exclude password and __v
  return {
    ...userData,
    createdAt: userData.createdAt?.$date ? new Date(parseInt(userData.createdAt.$date.$numberLong)).toISOString() : userData.createdAt,
    lastLogin: userData.lastLogin?.$date ? new Date(parseInt(userData.lastLogin.$date.$numberLong)).toISOString() : userData.lastLogin,
    lastUpdated: userData.lastUpdated?.$date ? new Date(parseInt(userData.lastUpdated.$date.$numberLong)).toISOString() : userData.lastUpdated,
    updatedAt: userData.updatedAt?.$date ? new Date(parseInt(userData.updatedAt.$date.$numberLong)).toISOString() : userData.updatedAt,
    wishlist: userData.wishlist?.map(item => ({
      ...item,
      addedAt: item.addedAt?.$date ? new Date(parseInt(item.addedAt.$date.$numberLong)).toISOString() : item.addedAt,
    })) || [],
    avatar: userData.avatar ? `data:image/png;base64,${userData.avatar}` : null,
  };
};

// GET all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks", details: error.message });
  }
});

// POST create a new task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, priority, due } = req.body;
    if (!title || !due) {
      return res.status(400).json({ error: "Title and due date are required" });
    }

    const newTask = new Task({
      title,
      priority,
      due: new Date(due),
      completed: false,
    });

    await newTask.save();
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task", details: error.message });
  }
});

// PUT update task (for toggling completion)
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid task ID format" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { completed, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task", details: error.message });
  }
});

// DELETE a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid task ID format" });
    }

    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task", details: error.message });
  }
});

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products.map(formatProduct));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products", details: err.message });
  }
});

// Get All Users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users.map(formatUser));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users", details: error.message });
  }
});

// Send OTP to admin email
app.post("/api/admin/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email !== "contact.balaguruvachettiarsons@gmail.com") {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    const otp = generateOTP();
    otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

    const mailOptions = {
      from: 'contact.balaguruvachettiarsons@gmail.com',
      to: email,
      subject: 'Your Admin Login OTP - K.Balaguruva Chettiar',
      text: `Your one-time password (OTP) for admin login is: ${otp}\nThis OTP is valid for 10 minutes.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP", details: error.message });
  }
});

// Verify OTP
app.post("/api/admin/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const storedData = otpStore.get(email);
    if (!storedData) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    if (Date.now() > storedData.expires) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    otpStore.delete(email);

    const token = jwt.sign(
      { email, role: "admin" },
      "4953546c308be3088b28807c767bd35e99818434d130a588e5e6d90b6d1d326e",
      { expiresIn: "1h" }
    );

    res.status(200).json({ success: true, message: "OTP verified", token });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Failed to verify OTP", details: error.message });
  }
});

// Fetch cart by userId and enrich with product details
app.get("/api/carts/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.json({ items: [] });
    }

    const enrichedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const product = await Product.findById(item.productId);
          if (!product) {
            return {
              productId: item.productId,
              quantity: item.quantity,
              name: 'Unknown Product',
              mrp: 0,
              discountedPrice: 0,
              image: null,
              description: null,
              category: null,
              status: 'Not Found'
            };
          }
          return {
            productId: item.productId,
            quantity: item.quantity,
            name: product.name,
            mrp: product.mrp,
            discountedPrice: product.discountedPrice,
            image: `data:image/png;base64,${product.image}`,
            description: product.description,
            category: product.category,
            status: 'Available'
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
          return {
            productId: item.productId,
            quantity: item.quantity,
            name: 'Unknown Product',
            mrp: 0,
            discountedPrice: 0,
            image: null,
            description: null,
            category: null,
            status: 'Error'
          };
        }
      })
    );

    res.json({ items: enrichedItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart", details: error.message });
  }
});

// Add item to cart
app.post("/api/carts/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity || quantity <= 0) {
      return res.status(400).json({ 
        error: 'Invalid input: userId, productId, and quantity are required, and quantity must be greater than 0' 
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart', details: error.message });
  }
});

// Get All Deleted Users
app.get("/api/deleted-users", async (req, res) => {
  try {
    const deletedUsers = await mongoose.connection
      .collection("deletedusers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formatDeletedUser = (user) => {
      const { password, __v, ...userData } = user;
      return {
        ...userData,
        createdAt: userData.createdAt?.$date ? new Date(parseInt(userData.createdAt.$date.$numberLong)).toISOString() : userData.createdAt,
        lastLogin: userData.lastLogin?.$date ? new Date(parseInt(userData.lastLogin.$date.$numberLong)).toISOString() : userData.lastLogin,
        lastUpdated: userData.lastUpdated?.$date ? new Date(parseInt(userData.lastUpdated.$date.$numberLong)).toISOString() : userData.lastUpdated,
        updatedAt: userData.updatedAt?.$date ? new Date(parseInt(userData.updatedAt.$date.$numberLong)).toISOString() : userData.updatedAt,
        wishlist: userData.wishlist?.map(item => ({
          ...item,
          addedAt: item.addedAt?.$date ? new Date(parseInt(item.addedAt.$date.$numberLong)).toISOString() : item.addedAt,
        })) || [],
        avatar: userData.avatar ? `data:image/png;base64,${userData.avatar}` : null,
      };
    };

    res.json({ success: true, users: deletedUsers.map(formatDeletedUser) });
  } catch (err) {
    console.error("Error fetching deleted users:", err);
    res.status(500).json({ error: "Failed to fetch deleted users", details: err.message });
  }
});

// Restore a user from deletedusers to users
app.post("/api/users/restore/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const deletedUser = await mongoose.connection
      .collection("deletedusers")
      .findOne({ _id: new mongoose.Types.ObjectId(id) });

    if (!deletedUser) {
      return res.status(404).json({ error: "Deleted user not found" });
    }

    const { _id, ...userData } = deletedUser;
    const newUser = new User(userData);
    await newUser.save();

    await mongoose.connection.collection("deletedusers").deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    res.json({
      success: true,
      message: "User restored successfully",
      userId: newUser._id
    });
  } catch (err) {
    console.error("Restore error:", err);
    res.status(500).json({ error: "Failed to restore user", details: err.message });
  }
});

// Restore a product from deletedproducts to Products
app.post("/api/products/restore/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const archivedProduct = await mongoose.connection
      .collection("deletedproducts")
      .findOne({ _id: new mongoose.Types.ObjectId(id) });

    if (!archivedProduct) {
      return res.status(404).json({ error: "Archived product not found" });
    }

    const { _id, ...productData } = archivedProduct;
    const newProduct = new Product(productData);
    await newProduct.save();

    await mongoose.connection.collection("deletedproducts").deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    res.json({
      success: true,
      message: "Product restored successfully",
      productId: newProduct._id
    });
  } catch (err) {
    console.error("Restore error:", err);
    res.status(500).json({ error: "Failed to restore product", details: err.message });
  }
});

// POST add a new product
app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { name, description, mrp, discount, discountedPrice, category, stock } = req.body;
    if (!req.file) return res.status(400).json({ error: "Image is required" });
    if (!name || !description || !mrp || !discount || !category || category === "" || !stock) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newProduct = new Product({
      name,
      description,
      mrp: Number(mrp),
      discount: Number(discount),
      discountedPrice: Number(discountedPrice),
      category,
      image: req.file.buffer.toString("base64"),
      stock: Number(stock)
    });

    console.log("New product before save:", newProduct);
    await newProduct.save();
    console.log("Product saved successfully:", newProduct);
    res.status(201).json({ message: "✅ Product added successfully", product: formatProduct(newProduct) });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product", details: err.message });
  }
});

// PUT update product by MongoDB _id
app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description || existingProduct.description,
      mrp: Number(req.body.mrp),
      discount: Number(req.body.discount),
      discountedPrice: Number(req.body.discountedPrice),
      category: req.body.category,
      stock: Number(req.body.stock)
    };

    if (req.file) {
      updateData.image = req.file.buffer.toString("base64");
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedProduct) {
      throw new Error("Failed to update product");
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: formatProduct(updatedProduct)
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update product", details: err.message });
  }
});

// Update Order Status Endpoint for Admin (No Authentication)
app.put("/api/orders/admin/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Status is required" 
      });
    }
    
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status value" 
      });
    }
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(400).json({ 
        success: false, 
        message: "Order not found" 
      });
    }
    
    if (status === "cancelled" && order.orderStatus !== "cancelled") {
      for (const item of order.orderItems) {
        const product = await Product.findOne({ name: item.name });
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }
    
    order.orderStatus = status;
    
    if (status === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'pending') {
      order.paymentStatus = 'completed';
    }
    
    if (status === 'cancelled') {
      if (order.paymentStatus === 'completed') {
        console.log(`Admin cancelled order ${id} with completed payment - refund may be needed`);
      } else if (order.paymentStatus === 'pending') {
        order.paymentStatus = 'failed';
      }
    }
    
    await order.save();
    
    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        _id: order._id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating order status (admin):", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update order status", 
      error: error.message 
    });
  }
});

// DELETE a product with archival
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await mongoose.connection.collection("deletedproducts").insertOne(product.toObject());
    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Product archived and deleted successfully",
      deletedId: id
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete product", details: err.message });
  }
});

// Get All Contacts
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contacts", details: error.message });
  }
});

// Update Contact Status
app.put("/api/contacts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid contact ID format" });
    }

    const validStatuses = ['pending', 'responded'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ error: "Invalid status value. Must be 'pending' or 'responded'." });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status: status.toLowerCase(), updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(200).json({
      success: true,
      message: "Contact status updated successfully",
      contact: updatedContact
    });
  } catch (error) {
    console.error("Error updating contact status:", error);
    res.status(500).json({ error: "Failed to update contact status", details: error.message });
  }
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(`Auth Header for ${req.path}:`, authHeader);

  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log(`No token provided for ${req.path}`);
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  console.log(`Token received: ${token}`);

  try {
    const verified = jwt.verify(token, "4953546c308be3088b28807c767bd35e99818434d130a588e5e6d90b6d1d326e");
    console.log(`Token verified for user:`, verified);
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

// Update Order Status (Authenticated)
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
    
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status value" 
      });
    }
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }
    
    order.orderStatus = status;
    
    if (status === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'pending') {
      order.paymentStatus = 'completed';
    }
    
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

// Get All Orders (Admin - Authenticated)
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders. Please try again later." });
  }
});

// Get All Orders (Admin - No Authentication)
app.get("/api/orders/admin/all", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
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

// Get All Deleted Products
app.get("/api/deleted-products", async (req, res) => {
  try {
    const archived = await mongoose.connection
      .collection("deletedproducts")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formatArchivedProduct = (product) => ({
      id: product.id,
      _id: product._id,
      name: product.name,
      description: product.description,
      mrp: product.mrp,
      discount: product.discount,
      discountedPrice: product.discountedPrice,
      category: product.category,
      image: `data:image/png;base64,${product.image}`,
      stock: product.stock,
      createdAt: product.createdAt
    });

    res.json({ success: true, products: archived.map(formatArchivedProduct) });
  } catch (err) {
    console.error("Error fetching deleted products:", err);
    res.status(500).json({ error: "Failed to fetch deleted products" });
  }
});

// Start the server and initialize the counter
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // Initialize the counter after the server starts
  initializeCounter();
});