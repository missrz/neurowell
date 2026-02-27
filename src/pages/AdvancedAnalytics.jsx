// src/pages/AdvancedAnalytics.jsx
import React, { useState, useEffect } from "react";
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

import { fetchAnalytics } from "../services/api";

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
const EmojiDot = (props) => {
  const { cx, cy, payload } = props || {};
  if (cx == null || cy == null || !payload) return null;

  // Prefer numeric values if present. Use nullish coalescing to allow 0 values.
  const raw = (payload.averageScore ?? payload.mood ?? payload.value ?? payload.moodValue ?? null);
  let moodVal = Number(raw);
  if (!Number.isFinite(moodVal)) moodVal = 3; // default

  // If mood is on 1-5 scale, clamp and round. If it's on 0-100, map down to 1-5 first.
  if (moodVal > 5) {
    // assume 0-100 percentage -> map to 1-5
    moodVal = 1 + (Math.round(moodVal) / 100) * 4;
  }

  const mood = Math.min(5, Math.max(1, Math.round(moodVal)));

  return (
    <text
      x={cx}
      y={cy - 12}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="26"
      fill="currentColor"
      style={{ pointerEvents: 'none' }}
    >
      {moodEmoji[mood] || moodEmoji[3]}
    </text>
  );
};

function formatGroupId(id) {
  if (!id) return "";
  if (typeof id === "string") return id;
  if (id.year && id.month && id.day) return `${id.year}-${String(id.month).padStart(2, "0")}-${String(id.day).padStart(2, "0")}`;
  if (id.year && id.month) return `${id.year}-${String(id.month).padStart(2, "0")}`;
  if (id.year && id.week) return `${id.year}-W${String(id.week).padStart(2, "0")}`;
  if (id.year) return `${id.year}`;
  return JSON.stringify(id);
}

export default function AdvancedAnalytics() {
  const [range, setRange] = useState("week");
  const [assessmentScore, setAssessmentScore] = useState(0); // out of 100
  const [assessmentCount, setAssessmentCount] = useState(0);

  const [moodChartData, setMoodChartData] = useState([]);
  const [journalChartData, setJournalChartData] = useState([]);
  const [valuableChartData, setValuableChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const mapPeriod = (r) => {
    switch (r) {
      case "day":
        return "day";
      case "week":
        return "week";
      case "month":
        return "month";
      case "year":
        return "year";
      default:
        return "day";
    }
  };

  useEffect(() => {
    console.log("hello")
    const load = async () => {
      
      setLoading(true);
      try {
        const period = mapPeriod(range);

        const [mRes, jRes, vGameRes, vAssessRes] = await Promise.all([
          fetchAnalytics("mood", period),
          fetchAnalytics("journal", period),
          fetchAnalytics("valuable", period, "game"),
          fetchAnalytics("valuable", period, "assessment"),
        ]);

        const toChart = (data, type) => {
          if (!data || !Array.isArray(data.data)) return [];
          return data.data.map((d) => {
            const rawAvg = d.averageScore ?? (d.totalScore && d.count ? d.totalScore / d.count : 0);
            let averageScore = Number(rawAvg);
            if (!Number.isFinite(averageScore)) averageScore = 0;

            // Normalize all chart averages to 1-5 scale.
            // If value looks like 0-100 percentage -> map to 1-5.
            if (averageScore > 5 && averageScore <= 100) {
              averageScore = 1 + (averageScore / 100) * 4;
            }
            // If value is greater than 100, clamp down (possible bad data)
            if (averageScore > 100) averageScore = 100;
            // Clamp to 1-5 and round to one decimal
            averageScore = Math.min(5, Math.max(1, Math.round(averageScore * 10) / 10));

            return {
              label: formatGroupId(d._id),
              averageScore,
              totalScore: d.totalScore || 0,
              count: d.count || 0,
            };
          });
        };

        const mData = toChart(mRes, 'mood');
        const jData = toChart(jRes, 'journal');
        const vGameData = toChart(vGameRes, 'valuable');
        const vAssessData = toChart(vAssessRes, 'valuable');

        setMoodChartData(mData);
        setJournalChartData(jData);
        setValuableChartData(vGameData);

        // Compute assessment-only average (weighted by counts) and normalize to 1-5
        const assessTotal = vAssessData.reduce((s, x) => s + (x.totalScore || 0), 0);
        const assessCount = vAssessData.reduce((s, x) => s + (x.count || 0), 0);
        let assessAvg = assessCount > 0 ? assessTotal / assessCount : null;

        // Normalize assessAvg to 1-5
        let assessScore1to5 = 1;
        if (assessAvg === null) {
          assessScore1to5 = 1;
        } else if (assessAvg > 5 && assessAvg <= 100) {
          assessScore1to5 = 1 + (assessAvg / 100) * 4;
        } else if (assessAvg >= 1 && assessAvg <= 5) {
          assessScore1to5 = assessAvg;
        } else {
          // clamp unexpected values
          assessScore1to5 = Math.max(1, Math.min(5, assessAvg || 1));
        }

        // Round to one decimal for display
        assessScore1to5 = Math.round(assessScore1to5 * 10) / 10;
        setAssessmentScore(assessScore1to5);
        // store count for UI (small note)
        setAssessmentCount(assessCount);
      } catch (err) {
        console.error("Error loading analytics", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [range]);

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
          <p className="avg-text">Avg. Mood: <b>{moodChartData.length ? (Math.round((moodChartData.reduce((s, x) => s + (x.averageScore || 0), 0) / moodChartData.length) * 10) / 10) : 4.6}</b> 😊</p>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodChartData.length ? moodChartData : moodData} margin={{ top: 48, right: 24, left: 24, bottom: 36 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={moodChartData.length ? "label" : "day"} />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Line
                dataKey={moodChartData.length ? "averageScore" : "mood"}
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
            <BarChart data={journalChartData.length ? journalChartData : journalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={journalChartData.length ? "label" : "day"} />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Legend />
              {journalChartData.length ? (
                <Bar dataKey="averageScore" fill="#22c55e" />
              ) : (
                <>
                  <Bar dataKey="positive" fill="#22c55e" />
                  <Bar dataKey="negative" fill="#ef4444" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>

          <p className="quote">
            “Remember, it’s okay to seek support when you need it.”
          </p>
        </div>

        {/* ================= GAME PROGRESS ================= */}
        <div className="card">
          <h3 className="card-title">Game Progress</h3>
          {valuableChartData.length ? (
            <p className="avg-text">Average Level: <b>{
              Math.round(
                (
                  valuableChartData.reduce((sum, item) => sum + ((item.averageScore || 0) * (item.count || 1)), 0)
                  / Math.max(1, valuableChartData.reduce((sum, item) => sum + (item.count || 1), 0))
                ) * 10
              ) / 10
            }</b> 🎮</p>
          ) : (
            <p className="avg-text no-data">No game analytics available</p>
          )}

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={valuableChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Bar dataKey="averageScore" fill="#38bdf8" radius={[6, 6, 0, 0]} />
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
                        strokeDashoffset={251 - (((assessmentScore - 1) / 4) * 251)}
              />

              {/* NEEDLE */}
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="30"
                stroke="#1f2937"
                strokeWidth="3"
                        transform={`rotate(${(assessmentScore != null ? ((assessmentScore - 1) / 4) * 180 : 0) - 90} 100 100)`}
              />

              {/* Center Dot */}
              <circle cx="100" cy="100" r="6" fill="#1f2937" />
            </svg>

            <div className="gauge-score">{assessmentScore}</div>
            <div className="gauge-label">Average Mental Health Score</div>
            <div className="gauge-note">Based on {assessmentCount} assessment{assessmentCount !== 1 ? 's' : ''}</div>
          </div>
        </div>

        </div>
      </div>
  );
}