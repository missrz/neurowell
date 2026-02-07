const express = require('express');
const Assesment = require('../models/Assesment');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/assesments - index all (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      console.warn('Unauthorized attempt to list all assesments by user', req.user && req.user.id);
      return res.status(403).json({ message: 'Forbidden: admin only' });
    }
    const items = await Assesment.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    console.error('Error listing assesments', err && err.message ? err.message : err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/assesments/:id - read (authenticated users and admins)
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Assesment.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Assesment not found' });
    res.status(200).json(item);
  } catch (err) {
    console.error('Error fetching assesment', err && err.message ? err.message : err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// DELETE /api/assesments/:id - admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      console.warn('Unauthorized attempt to delete assesment by user', req.user && req.user.id);
      return res.status(403).json({ message: 'Forbidden: admin only' });
    }
    const deleted = await Assesment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Assesment not found' });
    res.status(200).json({ message: 'Assesment deleted successfully' });
  } catch (err) {
    console.error('Error deleting assesment', err && err.message ? err.message : err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;
