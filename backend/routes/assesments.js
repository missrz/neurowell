const express = require('express');
const Assesment = require('../models/Assesment');
const Question = require('../models/Question');
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
    // fetch all questions for these assessments in a single query
    const ids = items.map(i => i._id);
    const questions = await Question.find({ assesmentId: { $in: ids } }).sort({ createdAt: 1 });
    const qByA = {};
    questions.forEach(q => {
      const key = q.assesmentId.toString();
      if (!qByA[key]) qByA[key] = [];
      qByA[key].push(q);
    });
    const result = items.map(item => ({ ...item.toObject(), questions: qByA[item._id.toString()] || [] }));
    console.log('Returning', result.length, 'assessments with questions');
    res.status(200).json(result);
  } catch (err) {
    console.error('Error listing assesments', err && err.message ? err.message : err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/assesments/today - get today's assessment for the user (authenticated users)
router.get('/today', auth, async (req, res) => {
  try {
    // get latest assessment
    const assesment = await Assesment.findOne().select('-aiResponse').sort({ createdAt: -1 });

    if (!assesment) {
      return res.status(404).json({ message: 'No assessment found' });
    }

    // fetch questions for this assessment
    const questions = await Question
      .find({ assesmentId: assesment._id })
      .sort({ createdAt: 1 });

    // attach questions
    const result = {
      ...assesment.toObject(),
      questions: questions || []
    };

    console.log('Returning latest assessment with questions');

    res.status(200).json(result);

  } catch (err) {
    console.error('Error listing assesments', err?.message || err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/assesments/:id - read (authenticated users and admins)
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Assesment.findById(req.params.id).select('-aiResponse');
    if (!item) return res.status(404).json({ message: 'Assesment not found' });
    const questions = await Question.find({ assesmentId: item._id }).sort({ createdAt: 1 });
    res.status(200).json({ ...item.toObject(), questions });
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
