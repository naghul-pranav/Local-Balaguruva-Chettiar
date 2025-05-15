const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");

// Remove item from cart
router.post("/remove", async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter(item => String(item.productId) !== String(productId));
    await cart.save();

    return res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("❌ Error removing item from cart:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
