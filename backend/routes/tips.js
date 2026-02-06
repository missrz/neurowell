const express = require('express');
const bcrypt = require('bcrypt');
const Tip = require('../models/Tip');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// ============================
// Create / Save a Tip
// POST /api/tips
// ============================
router.post("/", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    const { title, description, isReaded, entity_id, entityType, userId } = req.body;

    if (!description) {
      return res.status(400).json({ message: "Tip description is required" });
    }

    const tip = new Tip({
      title,
      description,
      isReaded,
      entity_id,
      entityType,
      userId: userId || req.user.id, // 🔥 from token or request body
    });

    const savedTip = await tip.save();

    res.status(201).json(savedTip);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Get all tips (admin/debug)
// GET /api/tips
// ============================
router.get("/", auth, async (req, res) => {
  try {
    // Admin-only: only users with isAdmin flag may list all tips
    if (!req.user || !req.user.isAdmin) {
      console.warn('Unauthorized attempt to list all tips by user', req.user && req.user.id);
      return res.status(403).json({ message: 'Forbidden: admin only' });
    }
    const tips = await Tip.find().sort({ date: -1 });
    res.status(200).json(tips);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Get tips by user
// GET /api/tips/user/:userId
// ============================
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const tips = await Tip.find({ userId }).sort({ date: -1 });
    res.status(200).json(tips);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Get tips by user and date
// GET /api/tips/user/:userId/:date
// ============================
router.get("/user/:userId/:date", auth, async (req, res) => {
  try {
    const { userId, date } = req.params;

    const tip = await Tip.findOne({ userId, date });

    if (!tip) {
      return res.status(404).json({ message: "Tip not found" });
    }

    res.status(200).json(tip);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Update tip by ID
// PUT /api/tips/:id
// ============================
router.put("/:id", auth, async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id);

    if (!tip) {
      return res.status(404).json({ message: "Tip not found" });
    }

    if (tip.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.user.isAdmin) {
      tip.title = req.body?.payload?.title;
      tip.description = req.body?.payload?.description;
    }
    tip.isReaded = req.body?.payload?.isReaded;    

    await tip.save();

    res.status(200).json(tip);
  } catch (error) {
    res.status(422).json({ message: "Server error", error });
  }
});

// ============================
// Show tip by ID
// GET /api/tips/:id
// ============================
router.get("/:id", auth, async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id);

    if (!tip) {
      return res.status(404).json({ message: "Tip not found" });
    }

    if (tip.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(tip);
  } catch (error) {
    res.status(422).json({ message: "Server error", error });
  }
});

// ============================
// Delete tip by ID
// DELETE /api/tips/:id
// ============================
router.delete("/:id", auth, async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id);

    if (!tip) {
      return res.status(404).json({ message: "Tip not found" });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await tip.deleteOne();
    res.status(200).json({ message: "Tip deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Update tip As readed by UserID
// PUT /api/tips/:userId/readed
// ============================
router.put("/:userId/readed", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    await Tip.updateMany(
      { userId },
      { $set: { isReaded: true } }
    );

    const tips = await Tip.find({ userId }).sort({ date: -1 });
    res.status(200).json(tips);
  } catch (error) {
    res.status(422).json({ message: "Server error", error });
  }
});


module.exports = router;
