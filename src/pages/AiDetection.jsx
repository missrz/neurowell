import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/AiDetection.css";

export default function AiDetection() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const analyzeText = async () => {
    if (!text.trim()) return alert("Please enter your feelings.");
    setLoading(true);

    try {
      const response = await axios.post("/api/detect", { text });
      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error connecting to server.");
    }

    setLoading(false);
  };

  return (
    <div className="ai-container">
      <button
        className="close-btn animate_animated animate_fadeIn"
        onClick={() => navigate("/dashboard")}
      >
        ✕
      </button>
      <h1 className="title">AI Mental Health Detection</h1>

      <textarea
        className="input-box"
        placeholder="Describe how you feel today..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button className="analyze-btn" onClick={analyzeText} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Mood"}
      </button>

      {result && (
        <div className="result-box">
          <h3>🧠 Prediction Result</h3>
          <p><strong>Mood:</strong> {result.mood}</p>
          <p><strong>Confidence:</strong> {result.confidence}%</p>
          <p><strong>Advice:</strong> {result.advice}</p>
        </div>
      )}
    </div>
  );
}
