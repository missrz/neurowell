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
// // ============================
// Update resource (ADMIN ONLY)
// PUT /api/resources/:id
// ============================
router.put("/:id", auth, async (req, res) => {
  try {
    // 1️⃣ Admin check
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    // 2️⃣ Find resource
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // 3️⃣ Update only allowed fields (Journal-style)
    let updated = false;

    for (const field of ALLOWED_FIELDS) {
      if (req.body?.[field] !== undefined) {
        resource[field] = String(req.body[field]);
        updated = true;
      }
    }

    // 4️⃣ No valid fields sent
    if (!updated) {
      return res.status(400).json({
        message: "No permitted fields provided"
      });
    }

    // 5️⃣ Save
    await resource.save();

    res.status(200).json(resource);
  } catch (err) {
    console.error("Update resource error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================
// Get ALL resources (ADMIN ONLY)
// GET /api/resources
// ============================
router.get("/", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      console.warn(
        "Unauthorized attempt to list all resources by user",
        req.user && req.user.id
      );
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    console.log("Admin listing all resources:", req.user.id);

    const resources = await Resource.find().sort({ createdAt: -1 });
    res.status(200).json(resources);
  } catch (error) {
    console.error("Get all resources error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ============================
// Get SINGLE resource (ADMIN ONLY)
// GET /api/resources/:id
// ============================
router.get("/:id", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      console.warn(
        "Unauthorized attempt to access resource",
        req.user && req.user.id,
        "resource:",
        req.params.id
      );
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    console.log(
      "Admin requesting resource",
      "admin:",
      req.user.id,
      "resource:",
      req.params.id
    );

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      console.warn("Resource not found:", req.params.id);
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json(resource);
  } catch (err) {
    console.error("Get resource by ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
