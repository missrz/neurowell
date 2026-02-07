const express = require("express");
const router = express.Router();
const Resource = require("../models/Resources");
const auth = require("../middleware/authMiddleware");

const ALLOWED_FIELDS = [
  "type",
  "title",
  "description",
  "url",
  "language"
];

// ============================
// Create resource (ADMIN ONLY)
// POST /api/resources
// ============================
router.post("/", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    const data = {};
    for (const field of ALLOWED_FIELDS) {
      if (field in req.body) {
        data[field] = String(req.body[field]);
      }
    }

    if (!data.type || !data.title || !data.url) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const resource = await Resource.create(data);
    res.status(201).json(resource);
  } catch (err) {
    console.error("Create resource error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================
// Update resource (ADMIN ONLY)
// put /api/resources/:id
// ============================
router.put("/:id", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    const updates = {};
    for (const field of ALLOWED_FIELDS) {
      if (field in req.body) {
        updates[field] = String(req.body[field]);
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No permitted fields provided" });
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(resource);
  } catch (err) {
    console.error("Update resource error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================
// Delete resource (ADMIN ONLY)
// DELETE /api/resources/:id
// ============================
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    await resource.deleteOne();
    res.json({ message: "Resource deleted successfully" });
  } catch (err) {
    console.error("Delete resource error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================
// Read resources (ALL USERS)
// GET /api/resources
// ============================
router.get("/", auth, async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ============================
// Read single resource
// GET /api/resources/:id
// ============================
router.get("/:id", auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
