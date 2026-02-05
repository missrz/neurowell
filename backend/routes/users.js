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

module.exports = router;
