import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StressGames.css";

/* ----------------- LocalStorage helpers ----------------- */
function saveBest(key, value) {
  const prev = Number(localStorage.getItem(key) || 0);
  if (value > prev) localStorage.setItem(key, value);
}
function loadBest(key) {
  return Number(localStorage.getItem(key) || 0);
}

/* ----------------- Logic Mind Game ----------------- */
export default function LogicMindGame() {
  const navigate = useNavigate();

  const [level, setLevel] = useState(1);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(15);
  const timerRef = useRef(null);

  const questions = {
    1: [
      { q: "2, 4, 8, 16, ?", options: [24, 32, 18, 20], ans: 32 },
      { q: "Position of M?", options: [12, 13, 14, 15], ans: 13 },
    ],
    2: [
      { q: "A + D + F = ?", options: [9, 10, 11, 12], ans: 11 },
      { q: "5, 10, 20, ?", options: [30, 40, 25, 35], ans: 40 },
    ],
    3: [
      { q: "CAT = 24, DOG = ?", options: [26, 22, 28, 30], ans: 26 },
      { q: "3, 6, 11, 18, ?", options: [27, 29, 26, 30], ans: 27 },
    ],
    4: [
      { q: "If A=1, Z=?", options: [24, 25, 26, 27], ans: 26 },
    ],
    5: [
      { q: "1, 4, 9, 16, ?", options: [20, 25, 30, 36], ans: 25 },
    ],
  };

  const current = questions[level][qIndex];

  /* ---------------- Timer ---------------- */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t === 1) {
          handleWrong();
          return 15;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [qIndex, level]);

  function handleAnswer(opt) {
    clearInterval(timerRef.current);

    if (opt === current.ans) {
      const newScore = score + 10 * level;
      setScore(newScore);
      saveBest("logicGame", newScore);
    } else {
      handleWrong();
      return;
    }

    nextQuestion();
  }

  function handleWrong() {
    clearInterval(timerRef.current);
    setLives((l) => {
      if (l - 1 <= 0) {
        alert("Game Over 😢");
        return 0;
      }
      return l - 1;
    });
    nextQuestion();
  }

  function nextQuestion() {
    setTime(30);

    if (qIndex + 1 < questions[level].length) {
      setQIndex(qIndex + 1);
    } else if (level < 5) {
      setLevel(level + 1);
      setQIndex(0);
    } else {
      alert("🎉 All Levels Completed!");
    }
  }

  if (lives === 0) {
    return (
      <div className="stress-games-container">
        <button className="mood-close-btn" onClick={() => navigate("/dashboard")}>
          ✕
        </button>
        <div className="mini-game card glass p-4 text-center text-white">
          <h4>Game Over 😢</h4>
          <p>Final Score: {score}</p>
          <p>Best Score: {loadBest("logicGame")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stress-games-container">
      <button className="mood-close-btn" onClick={() => navigate("/dashboard")}>
        ✕
      </button>

      <div className="mini-game card glass p-4 text-center animate__animated animate__fadeIn">
        <h5 className="text-white mb-2 neon-title">Logic Mind Game 🧠</h5>

        <div className="d-flex justify-content-between text-white mb-2">
          <span>⏱ {time}s</span>
          <span>❤️ {lives}</span>
          <span>⭐ {score}</span>
        </div>

        <h6 className="text-white mb-3">
          Level {level} • Q{qIndex + 1}
        </h6>

        <p className="text-white fw-bold">{current.q}</p>

        <div className="d-grid gap-2">
          {current.options.map((o, i) => (
            <button
              key={i}
              className="btn btn-outline-light"
              onClick={() => handleAnswer(o)}
            >
              {o}
            </button>
          ))}
        </div>

        <div className="mt-2 text-muted small">
          Best Score: {loadBest("logicGame")}
        </div>
      </div>
    </div>
  );
}
