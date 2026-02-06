const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Update permitted user fields: full_name, email, password, preferences, termsaAndAccepted, imagePath
router.patch('/:id', auth, async (req, res) => {
  const userId = req.params.id;
  const caller = req.user; // set by auth middleware

  if (!caller) return res.status(401).json({ error: 'Unauthorized' });

  // Only allow users to update their own profile unless caller is admin
  if (caller.id !== userId && !caller.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { fullName, email, password, preferences, termsaAndAccepted, imagePath } = req.body;

  const updates = {};

  if (typeof imagePath !== 'undefined') updates.imagePath = String(imagePath);
  if (typeof fullName !== 'undefined') updates.fullName = String(fullName);
  if (typeof termsaAndAccepted !== 'undefined') updates.termsaAndAccepted = Boolean(termsaAndAccepted);
  if (typeof email !== 'undefined') {
    const emailStr = String(email).toLowerCase();
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(emailStr)) return res.status(400).json({ error: 'Invalid email format' });
    // ensure uniqueness
    const existing = await User.findOne({ email: emailStr });
    if (existing && existing._id.toString() !== userId) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    updates.email = emailStr;
  }

  if (typeof password !== 'undefined') {
    if (String(password).length < 6) return res.status(400).json({ error: 'Password too short' });
    const saltRounds = 10;
    updates.passwordHash = await bcrypt.hash(String(password), saltRounds);
  }

  if (typeof preferences !== 'undefined') {
    // accept object or JSON string
    if (typeof preferences === 'string') {
      try {
        updates.preferences = JSON.parse(preferences);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid preferences JSON' });
      }
    } else if (typeof preferences === 'object') {
      updates.preferences = preferences;
    } else {
      return res.status(400).json({ error: 'Invalid preferences format' });
    }
  }

  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No permitted fields provided' });

  try {
    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('User update error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================
// Get all users (admin/debug)
// GET /api/users
// ============================
router.get("/", auth, async (req, res) => {
  try {
    // Admin-only: only users with isAdmin flag may list all users
    if (!req.user || !req.user.isAdmin) {
      console.warn('Unauthorized attempt to list all users by user', req.user && req.user.id);
      return res.status(403).json({ message: 'Forbidden: admin only' });
    }
    const users = await User.find().sort({ date: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Show a user by ID
// GET /api/users/:id
// ============================
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Delete a user by ID
// DELETE /api/users/:id
// ============================
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Allow delete if user is owner OR admin
    if (user._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
