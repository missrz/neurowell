const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:5001";
const PORT = process.env.PORT || 5000;

app.post("/api/detect", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  try {
    const response = await axios.post(`${AI_SERVER_URL}/predict`, { text });
    res.json(response.data);
  } catch (error) {
    console.error("Error connecting to Python server:", error.message);
    res.status(500).json({ error: "Python AI server error" });
  }
});

app.listen(PORT, () => console.log(`Node backend running on port ${PORT}`));
