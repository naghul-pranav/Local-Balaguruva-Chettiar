const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const DeletedUser = require('../models/DeletedUser');

// DELETE /api/user/account
router.delete('/api/user/account', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  await DeletedUser.create({ ...user.toObject(), deletedAt: new Date() });
  await user.deleteOne();

  res.json({ message: "Account deleted successfully" });
});

module.exports = router;
