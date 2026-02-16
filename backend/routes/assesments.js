const express = require('express');
const Assesment = require('../models/Assesment');
const Question = require('../models/Question');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
const ValuableHistory = require('../models/valueableHistory');
const { scoreText } = require('../services/aiService');
const Tip = require('../models/Tip');

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

    // check if user already completed this assessment today
    try {
      console.log('Checking valuable history for user', req.user.id, 'and assessment', assesment._id);
      const history = await ValuableHistory.findOne({
        type: 'assessment',
        userId: req.user.id,
        entity_id: assesment._id.toString()
      }).sort({ createdAt: -1 });

      result.alreadyCompleted = !!history;
      result.history = history || null;
    } catch (e) {
      console.error('Error checking valuable history for today', e && e.message ? e.message : e);
      result.alreadyCompleted = false;
      result.history = null;
    }

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

// POST /api/assesments/:id/complete - submit answers, grade, and save history
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const assesment = await Assesment.findById(req.params.id);
    if (!assesment) return res.status(404).json({ message: 'Assesment not found' });

    // fetch questions for this assessment
    const questions = await Question.find({ assesmentId: assesment._id }).sort({ createdAt: 1 });

    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];

    // grade: compare provided answers (strings) with question.correctAnswer
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const given = answers[idx];
      if (typeof given !== 'undefined' && String(given).trim() === String(q.correctAnswer).trim()) {
        correctCount += 1;
      }
    });

    const total = questions.length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // create valuable history entry
    const history = await ValuableHistory.create({
      type: 'assessment',
      name: assesment.title || `Assessment ${assesment._id}`,
      score,
      userId: req.user.id,
      entity_id: assesment._id.toString()
    });

    // run background AI scoring + tip creation (non-blocking)
    setImmediate(() => {
      (async () => {
        try {
          // build text from questions and provided answers
          const pairs = questions.map((q, idx) => {
            const given = typeof answers[idx] !== 'undefined' ? String(answers[idx]) : '';
            return `${q.title}\nAnswer: ${given}`;
          });
          const text = pairs.join('\n\n');

          const aiResp = await scoreText(text);
          const aiScore = aiResp && aiResp.score != null ? aiResp.score : null;
          const aiData = aiResp.raw || aiResp;

          // create Tip with advice from AI
          try {
            let advice = '';
            if (aiData) {
              if (typeof aiData === 'object') {
                advice = aiData.advice || aiData.message || aiData.text || '';
              } else if (typeof aiData === 'string') {
                advice = aiData;
              }
            }
              const { formatDateTime } = require('../utils/formatDate');
              const title = `Assessment advice for ${assesment.title || assesment._id} on ${formatDateTime(new Date())}`;
              const tip = new Tip({ userId: req.user.id, title, description: advice || '', entity_id: assesment._id.toString(), entityType: 'assessment' });
            await tip.save();
          } catch (e) {
            console.error('Failed to create Tip for assessment', assesment._id, e && e.message ? e.message : e);
          }

          console.log('Background assessment scoring finished for user', req.user.id, 'score:', aiScore);
        } catch (err) {
          console.error('Background AI scoring error for assessment', assesment._id, err && err.message ? err.message : err);
        }
      })();
    });

    res.status(200).json({
      message: 'Assessment graded',
      totalQuestions: total,
      correctCount,
      score,
      history
    });
  } catch (err) {
    console.error('Error completing assesment', err && err.message ? err.message : err);
    res.status(500).json({ message: 'Server error' });
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
