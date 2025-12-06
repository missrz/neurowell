// import React, { useState } from "react";
// import axios from "axios";
// import "../styles/AiDetection.css";

// export default function AiDetection() {
//   const [text, setText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);

//   const analyzeText = async () => {
//     if (!text.trim()) return alert("Please enter your feelings.");
//     setLoading(true);

//     try {
//       const response = await axios.post("/api/detect", { text });
//       setResult(response.data);
//     } catch (error) {
//       console.error(error);
//       alert("Error connecting to server.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="ai-container">
//       <h1 className="title">AI Mental Health Detection</h1>

//       <textarea
//         className="input-box"
//         placeholder="Describe how you feel today..."
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//       />

//       <button className="analyze-btn" onClick={analyzeText} disabled={loading}>
//         {loading ? "Analyzing..." : "Analyze Mood"}
//       </button>

//       {result && (
//         <div className="result-box">
//           <h3>🧠 Prediction Result</h3>
//           <p><strong>Mood:</strong> {result.mood}</p>
//           <p><strong>Confidence:</strong> {result.confidence}%</p>
//           <p><strong>Advice:</strong> {result.advice}</p>
//         </div>
//       )}
//     </div>
//   );
// }

import React from "react";
import "../styles/AIDetector.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

export default function AIDetector() {
  return (
    <div
      className="ai-detector-container text-light"
      style={{ background: "#0d0d0d", minHeight: "100vh", padding: "50px 20px" }}
    >
      <h1 className="text-center mb-5 animate__animated animate__fadeInDown">
        <span className="ai-text">AI</span>{" "}
        <span className="detector-text">Detector</span>
      </h1>

      <div className="container">
        <div className="row g-4">
          {/* Example Card 1 */}
          <div className="col-12 col-md-6 col-lg-4 animate__animated animate__fadeInUp">
            <div className="card ai-card p-4 text-center h-100">
              <div className="icon mb-3">🧠</div>
              <h5>Mental Pattern Analysis</h5>
              <p>Detect patterns in your mental state using AI-powered algorithms.</p>
            </div>
          </div>

          {/* Example Card 2 */}
          <div className="col-12 col-md-6 col-lg-4 animate__animated animate__fadeInUp" style={{ animationDelay: "0.2s" }}>
            <div className="card ai-card p-4 text-center h-100">
              <div className="icon mb-3">📊</div>
              <h5> Cognitive Score </h5>
              <p>Evaluate your mental clarity and stress levels with AI scoring.</p>
            </div>
          </div>

          {/* Example Card 3 */}
          <div className="col-12 col-md-6 col-lg-4 animate__animated animate__fadeInUp" style={{ animationDelay: "0.4s" }}>
            <div className="card ai-card p-4 text-center h-100">
              <div className="icon mb-3">💡</div>
              <h5>Insights & Recommendations</h5>
              <p>Get actionable insights to maintain mental wellbeing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
