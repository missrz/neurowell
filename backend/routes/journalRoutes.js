const express = require("express");
const router = express.Router();
const Journal = require("../models/Journal");
const auth = require("../middleware/authMiddleware");

// ============================
// Create / Save a journal
// POST /api/journals
// ============================
router.post("/", auth, async (req, res) => {
  try {
    console.log(req.body.payload);
    const { title, text, date } = req.body.payload;

    if (!text) {
      return res.status(400).json({ message: "Journal text is required" });
    }

    const journal = new Journal({
      title,
      text,
      date,
      userId: req.user.id, // 🔥 from token
    });

    const savedJournal = await journal.save();
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

    journal.title = req.body.title;
    journal.text = req.body.text;
    journal.date = req.body.date;

    await journal.save();
    res.status(200).json(journal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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
