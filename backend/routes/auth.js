const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const TOKEN_EXPIRY = '7d';

// Signup
router.post('/signup', async (req, res) => {
  const { fullName, email, password, termsAndAccepted, imagePath, preferences } = req.body;
  if (!fullName || !email || !password) return res.status(400).json({ error: 'Full name, email and password required' });
  if (!termsAndAccepted) return res.status(400).json({ error: 'Terms must be accepted' });
  // simple email format validation
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const emailLower = String(email).toLowerCase();
  if (!emailRegex.test(emailLower)) return res.status(400).json({ error: 'Invalid email format' });
  try {
    const existing = await User.findOne({ email: emailLower });
    if (existing) return res.status(400).json({ error: 'User already exists' });
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userData = { fullName, email: emailLower, passwordHash, termsAndAccepted: Boolean(termsAndAccepted), imagePath };
    if (typeof preferences !== 'undefined') {
      if (typeof preferences === 'string') {
        try {
          userData.preferences = JSON.parse(preferences);
        } catch (e) {
          return res.status(400).json({ error: 'Invalid preferences JSON' });
        }
      } else if (typeof preferences === 'object') {
        userData.preferences = preferences;
      } else {
        return res.status(400).json({ error: 'Invalid preferences format' });
      }
    }
    const user = new User(userData);
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) {
    console.error('Signup error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user (requires token in Authorization: Bearer <token>)
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(data.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Me error', err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
