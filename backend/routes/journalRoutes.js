const express = require("express");
const router = express.Router();
const Journal = require("../models/Journal");
const auth = require("../middleware/authMiddleware");
const { scoreText } = require('../services/aiService');
const Tip = require('../models/Tip');

// ============================
// Create / Save a journal
// POST /api/journals
// ============================
router.post("/", auth, async (req, res) => {
  try {
    console.log(req.body.payload);
    const { title, text, date, pinned } = req.body.payload;

    if (!text) {
      return res.status(400).json({ message: "Journal text is required" });
    }

    const journal = new Journal({
      title,
      text,
      date,
      pinned: pinned || false ,
      userId: req.user.id, // 🔥 from toke n
    });

    const savedJournal = await journal.save();
    // background AI scoring + Tip creation
    setImmediate(() => {
      (async () => {
        console.log('Journal background job started for:', req.user.id, 'journal:', savedJournal._id);
        try {
          const payloadText = `${title || ''}\n${text || ''}`;
          const aiResp = await scoreText(payloadText);
          const score = aiResp && aiResp.score != null ? aiResp.score : null;
          const aiData = aiResp.raw || aiResp;
          await Journal.findByIdAndUpdate(savedJournal._id, { $set: { score, aiResponse: aiData } });

          // create Tip attached to journal
          try {
            let advice = '';
            if (aiData) {
              if (typeof aiData === 'object') {
                advice = aiData.advice || aiData.message || aiData.text || '';
              } else if (typeof aiData === 'string') {
                advice = aiData;
              }
            }
            const titleText = `my journal tracking advice for ${title || '(untitled)'} on ${date || (savedJournal.createdAt ? new Date(savedJournal.createdAt).toISOString() : '')}`;
            const tip = new Tip({ userId: req.user.id, title: titleText, description: advice || '', entity_id: savedJournal._id.toString(), entityType: 'journal' });
            await tip.save();
          } catch (e) {
            console.error('Failed to create Tip for journal', savedJournal._id, e && e.message ? e.message : e);
          }

          console.log('Journal background job finished for:', req.user.id, 'journal:', savedJournal._id, 'score:', score);
        } catch (err) {
          console.error('Journal background AI error for user', req.user.id, err && err.message ? err.message : err);
        }
      })();
    });

    res.status(201).json(savedJournal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Get all journals (admin/debug)
// GET /api/journals
// ============================
router.get("/", auth, async (req, res) => {
  try {
    // Admin-only: only users with isAdmin flag may list all journals
    if (!req.user || !req.user.isAdmin) {
      console.warn('Unauthorized attempt to list all journals by user', req.user && req.user.id);
      return res.status(403).json({ message: 'Forbidden: admin only' });
    }
    const journals = await Journal.find().sort({ date: -1 });
    res.status(200).json(journals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Get journals by user
// GET /api/journals/user/:userId
// ============================
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const journals = await Journal.find({ userId }).sort({ date: -1 });
    res.status(200).json(journals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Get journal by date
// GET /api/journals/user/:userId/:date
// ============================
router.get("/user/:userId/:date", auth, async (req, res) => {
  try {
    const { userId, date } = req.params;

    const journal = await Journal.findOne({ userId, date });

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    res.status(200).json(journal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Update journal by ID
// PUT /api/journals/:id
// ============================
router.put("/:id", auth, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    if (journal.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const pinned = req.body?.payload?.pinned;

    journal.title = req.body?.payload?.title;
    journal.text = req.body?.payload?.text;
    journal.date = req.body?.payload?.date;    
    journal.pinned =
      pinned === null || pinned === undefined
        ? journal.pinned
        : pinned;

    await journal.save();
    // background AI scoring + Tip creation on update
    setImmediate(() => {
      (async () => {
        console.log('Journal update background job started for:', req.user.id, 'journal:', journal._id);
        try {
          const payloadText = `${journal.title || ''}\n${journal.text || ''}`;
          const aiResp = await scoreText(payloadText);
          const score = aiResp && aiResp.score != null ? aiResp.score : null;
          const aiData = aiResp.raw || aiResp;
          await Journal.findByIdAndUpdate(journal._id, { $set: { score, aiResponse: aiData } });

          // create Tip attached to journal
          try {
            let advice = '';
            if (aiData) {
              if (typeof aiData === 'object') {
                advice = aiData.advice || aiData.message || aiData.text || '';
              } else if (typeof aiData === 'string') {
                advice = aiData;
              }
            }
            const titleText = `my journal tracking advice for ${journal.title || '(untitled)'} on ${journal.date || (journal.createdAt ? new Date(journal.createdAt).toISOString() : '')}`;
            const tip = new Tip({ userId: req.user.id, title: titleText, description: advice || '', entity_id: journal._id.toString(), entityType: 'journal' });
            await tip.save();
          } catch (e) {
            console.error('Failed to create Tip for journal', journal._id, e && e.message ? e.message : e);
          }

          console.log('Journal update background job finished for:', req.user.id, 'journal:', journal._id, 'score:', score);
        } catch (err) {
          console.error('Journal update background AI error for user', req.user.id, err && err.message ? err.message : err);
        }
      })();
    });

    res.status(200).json(journal);
  } catch (error) {
    res.status(422).json({ message: "Server error", error });
  }
});

// ============================
// Delete journal by ID
// DELETE /api/journals/:id
// ============================
router.delete("/:id", auth, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    if (journal.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await journal.deleteOne();
    res.status(200).json({ message: "Journal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
