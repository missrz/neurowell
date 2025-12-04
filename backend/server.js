const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/detect", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  try {
    const response = await axios.post("http://localhost:5001/predict", { text });
    res.json(response.data);
  } catch (error) {
    console.error("Error connecting to Python server:", error.message);
    res.status(500).json({ error: "Python AI server error" });
  }
});

app.listen(5000, () => console.log("Node backend running on port 5000"));
