// src/pages/AdvancedAnalytics.jsx
import React, { useState } from "react";
import "../styles/AdvancedAnalytics.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

/* ================= EMOJI MAP ================= */
const moodEmoji = {
  1: "😞",
  2: "😟",
  3: "🙂",
  4: "😊",
  5: "😄",
};

/* ================= DATA ================= */
const moodData = [
  { day: "Mon", mood: 2 },
  { day: "Tue", mood: 3 },
  { day: "Wed", mood: 3.5 },
  { day: "Thu", mood: 4 },
  { day: "Fri", mood: 4.3 },
  { day: "Sat", mood: 4.6 },
  { day: "Sun", mood: 4.8 },
];

const journalData = [
  { day: "Mon", positive: 6, negative: 3 },
  { day: "Tue", positive: 8, negative: 2 },
  { day: "Wed", positive: 5, negative: 4 },
  { day: "Thu", positive: 7, negative: 3 },
  { day: "Fri", positive: 6, negative: 2 },
  { day: "Sun", positive: 5, negative: 2 },
];

const gameData = [
  { level: 1, value: 1 },
  { level: 2, value: 2 },
  { level: 3, value: 3 },
  { level: 4, value: 4 },
  { level: 5, value: 5 },
  { level: 6, value: 6 },
  { level: 7, value: 7 },
  { level: 8, value: 8 },
  { level: 9, value: 9 },
  { level: 10, value: 8 },
];

/* ================= EMOJI DOT ================= */
const EmojiDot = ({ cx, cy, payload }) => {
  const mood = Math.round(payload.mood);
  return (
    <text x={cx} y={cy + 6} textAnchor="middle" fontSize="22">
      {moodEmoji[mood]}
    </text>
  );
};

export default function AdvancedAnalytics() {
  const [range, setRange] = useState("week");
  const assessmentScore = 72; // out of 100

  return (
    <div className="analytics-page">
      {/* HEADER */}
      <div className="header-row">
        <h1 className="page-title">Advanced Analytics</h1>

        <div className="range-selector">
          {["Day", "Week", "Month", "Year"].map((r) => (
            <button
              key={r}
              className={`range-btn ${
                range === r.toLowerCase() ? "active" : ""
              }`}
              onClick={() => setRange(r.toLowerCase())}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-two">
        {/* ================= MOOD TRACKER ================= */}
        <div className="card">
          <h3 className="card-title">Average Mood Detection</h3>
          <p className="avg-text">Avg. Mood: <b>4.6</b> 😊</p>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Line
                dataKey="mood"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={<EmojiDot />}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="scale">😞 Worst — 🙂 Okay — 😄 Best</div>
        </div>

        {/* ================= JOURNAL ================= */}
        <div className="card">
          <h3 className="card-title">Journal Insights</h3>
          <p className="journal-status">
            Mood: <b>You’re looking sad this week</b>
          </p>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={journalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="positive" fill="#22c55e" />
              <Bar dataKey="negative" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>

          <p className="quote">
            “Remember, it’s okay to seek support when you need it.”
          </p>
        </div>

        {/* ================= GAME PROGRESS ================= */}
        <div className="card">
          <h3 className="card-title">Game Progress</h3>
          <p className="avg-text">Average Level: <b>5.8</b> 🎮</p>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={gameData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ================= ASSESSMENT GAUGE ================= */}
<div className="card">
  <h3 className="card-title">Assessment Overview</h3>

  <div className="gauge-container">
    <svg viewBox="0 0 200 120" className="gauge-svg">
      {/* Background Arc */}
      <path
        d="M20 100 A80 80 0 0 1 180 100"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="16"
      />

      {/* Progress Arc */}
      <path
        d="M20 100 A80 80 0 0 1 180 100"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="16"
        strokeDasharray="251"
        strokeDashoffset={251 - (assessmentScore / 100) * 251}
      />

      {/* NEEDLE */}
      <line
        x1="100"
        y1="100"
        x2="100"
        y2="30"
        stroke="#1f2937"
        strokeWidth="3"
        transform={`rotate(${assessmentScore * 1.8 - 90} 100 100)`}
      />

      {/* Center Dot */}
      <circle cx="100" cy="100" r="6" fill="#1f2937" />
    </svg>

    <div className="gauge-score">{assessmentScore}</div>
    <div className="gauge-label">Average Mental Health Score</div>
  </div>
</div>

        </div>
      </div>
  );
}
