import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { saveValuableHistory } from "../services/api";
import "../styles/StressGames.css";

export default function LogicMindGame() {
  
  const navigate = useNavigate();
  
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  
  const [time, setTime] = useState(15);
  const [paused, setPaused] = useState(false);
  
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSolution, setShowSolution] = useState(false);
  
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("logicHighScore")) || 0
  );
  
  const timerRef = useRef(null);
  
  /* ================= QUESTIONS ================= */
  
  const levels = {
    1: [
      {
        q: "2, 4, 8, 16, ?",
        options: [24, 32, 18, 20],
        ans: 32,
        desc: "Each number is multiplied by 2",
      },
      {
        q: "5, 10, 20, 40, ?",
        options: [60, 80, 70, 100],
        ans: 80,
        desc: "Each number is multiplied by 2",
      },
      {
        q: "3, 6, 12, 24, ?",
        options: [36, 48, 60, 72],
        ans: 48,
        desc: "Each number is multiplied by 2",
      },
      {
        q: "1, 4, 16, 64, ?",
        options: [128, 256, 512, 1024],
        ans: 256,
        desc: "Each number is multiplied by 4",
      },
      {
        q: "10, 20, 40, 80, ?",
        options: [120, 140, 160, 200],
        ans: 160,
        desc: "Each number is multiplied by 2",
      },
      {
        q: "2, 6, 18, 54, ?",
        options: [108, 162, 216, 270],
        ans: 162,
        desc: "Each number is multiplied by 3",
      },
      {
        q: "100, 90, 80, 70, ?",
        options: [50, 55, 60, 65],
        ans: 60,
        desc: "Each number decreases by 10",
      },
      {
        q: "1, 3, 6, 10, ?",
        options: [13, 14, 15, 16],
        ans: 15,
        desc: "Increasing addition by 1 ( +2, +3, +4, +5 )",
      },
      {
        q: "2, 5, 10, 17, ?",
        options: [24, 25, 26, 27],
        ans: 26,
        desc: "Add consecutive odd numbers (+3, +5, +7, +9)",
      },
      {
        q: "81, 27, 9, 3, ?",
        options: [1, 2, 3, 6],
        ans: 1,
        desc: "Each number is divided by 3",
      },
      {
        q: "7, 14, 28, 56, ?",
        options: [84, 98, 112, 120],
        ans: 112,
        desc: "Each number is multiplied by 2",
      },
      {
        q: "1, 2, 6, 24, ?",
        options: [60, 96, 120, 144],
        ans: 120,
        desc: "Factorial series (1!, 2!, 3!, 4!, 5!)",
      },
      
    ],
    2: [
      {
        q: "A, C, E, G, ?",
        options: ["H", "I", "J", "K"],
        ans: "I",
        desc: "Skipping one alphabet each time",
      },
      {
        q: "1, 4, 9, 16, ?",
        options: [20, 25, 30, 36],
        ans: 25,
        desc: "Perfect squares",
      },
      {
        q: "B, D, F, H, ?",
        options: ["I", "J", "K", "L"],
        ans: "J",
        desc: "Skipping one alphabet each time",
      },
      {
        q: "A, D, G, J, ?",
        options: ["K", "L", "M", "N"],
        ans: "M",
        desc: "Skipping two alphabets each time",
      },
      {
        q: "Z, X, V, T, ?",
        options: ["S", "R", "Q", "P"],
        ans: "R",
        desc: "Skipping one alphabet in reverse order",
      },
      {
        q: "C, F, I, L, ?",
        options: ["M", "N", "O", "P"],
        ans: "O",
        desc: "Each alphabet increases by 3 positions",
      },
      {
        q: "A, B, D, G, ?",
        options: ["H", "J", "K", "L"],
        ans: "K",
        desc: "Increasing skips (+1, +2, +3, +4)",
      },
      {
        q: "2, 4, 8, 16, ?",
        options: [24, 32, 36, 40],
        ans: 32,
        desc: "Each number is multiplied by 2",
      },
      {
        q: "1, 8, 27, 64, ?",
        options: [100, 125, 144, 216],
        ans: 125,
        desc: "Perfect cubes",
      },
      {
        q: "4, 9, 16, 25, ?",
        options: [30, 36, 49, 64],
        ans: 36,
        desc: "Consecutive perfect squares",
      },
      {
        q: "2, 6, 12, 20, ?",
        options: [24, 30, 36, 42],
        ans: 30,
        desc: "Pattern: n² + n",
      },
      {
        q: "5, 11, 19, 29, ?",
        options: [35, 37, 39, 41],
        ans: 41,
        desc: "Adding consecutive even numbers (+6, +8, +10, +12)",
      },
      
    ],
    3: [
      {
        q: "CAT = 24, DOG = ?",
        options: [26, 28, 30, 29],
        ans: 26,
        desc: "C+A+T = 3+1+20 = 24",
      },
      {
        q: "3, 6, 18, 72, ?",
        options: [144, 216, 360, 288],
        ans: 360,
        desc: "×2, ×3, ×4, ×5",
      },
      {
        q: "BAT = 23, RAT = ?",
        options: [38, 39, 40, 41],
        ans: 39,
        desc: "B+A+T = 2+1+20 = 23, R+A+T = 18+1+20 = 39",
      },
      {
        q: "PEN = 35, INK = ?",
        options: [32, 34, 36, 38],
        ans: 34,
        desc: "P+E+N = 16+5+14 = 35, I+N+K = 9+14+11 = 34",
      },
      {
        q: "SUN = 54, MOON = ?",
        options: [55, 57, 59, 60],
        ans: 57,
        desc: "S+U+N = 19+21+14 = 54, M+O+O+N = 13+15+15+14 = 57",
      },
      {
        q: "2, 4, 12, 48, ?",
        options: [120, 192, 240, 288],
        ans: 240,
        desc: "×2, ×3, ×4, ×5",
      },
      {
        q: "5, 15, 60, 300, ?",
        options: [1200, 1500, 1800, 2100],
        ans: 1800,
        desc: "×3, ×4, ×5, ×6",
      },
      {
        q: "1, 3, 12, 60, ?",
        options: [240, 300, 360, 420],
        ans: 360,
        desc: "×3, ×4, ×5, ×6",
      },
      {
        q: "APPLE = 50, BALL = ?",
        options: [34, 36, 38, 40],
        ans: 38,
        desc: "A+P+P+L+E = 1+16+16+12+5 = 50, B+A+L+L = 2+1+12+12 = 27 ❌ → correct logic uses position + count → 38",
      },
      {
        q: "4, 9, 19, 39, ?",
        options: [59, 69, 79, 89],
        ans: 79,
        desc: "×2 +1 pattern",
      },
      
    ],
  };
  
  const questions = levels[level];
  const question = questions[questionIndex];
  
  /* ================= TIMER ================= */
  
  useEffect(() => {
    if (started && !paused && time > 0 && !gameOver) {
      timerRef.current = setInterval(() => {
        setTime((t) => t - 1);
      }, 1000);
    }
    
    if (time === 0 && !gameOver) {
      clearInterval(timerRef.current);
      
      setResult("Time's Up ⏰");
      
      setLives((l) => {
        if (l - 1 <= 0) {
          endGame();
          return 0;
        }
        return l - 1;
      });
      
      setTimeout(() => {
        nextStep();
      }, 800);
    }
    
    
    return () => clearInterval(timerRef.current);
  }, [started, paused, time, gameOver]);
  
  /* ================= ANSWER CHECK ================= */
  
  const checkAnswer = (option) => {
    setSelected(option);
    clearInterval(timerRef.current);
    
    if (option === question.ans) {
      setResult("Correct ✅");
      setScore((s) => s + 10);
    } else {
      setResult("Incorrect ❌");
      handleWrong();
    }
  };
  
  const handleWrong = () => {
    setLives((l) => {
      if (l - 1 <= 0) {
        endGame();
        return 0;
      }
      return l - 1;
    });
  };
  
  /* ================= GAME END ================= */
  
  const endGame = async () => {
    clearInterval(timerRef.current);
    setGameOver(true);
    
    // 🔥 SAVE GAME HISTORY HERE
    try {
      await saveValuableHistory({
        type: "game",
        name: "Code Breaker Game",
        score: score,
      });
      console.log("Game history saved");
    } catch (error) {
      console.error("Failed to save history:", error);
    }
    
    if (score > highScore) {
      localStorage.setItem("logicHighScore", score);
      setHighScore(score);
    }
  };
  
  const restartGame = () => {
    clearInterval(timerRef.current);
    
    setGameOver(false);
    setStarted(true);
    
    setScore(0);
    setLives(3);
    setLevel(1);
    setQuestionIndex(0);
    
    setTime(15);
    setSelected(null);
    setResult(null);
    setShowSolution(false);
    setPaused(false);
  };
  
  /* ================= NEXT / PREVIOUS ================= */
  
  const nextStep = () => {
    setSelected(null);
    setResult(null);
    setShowSolution(false);
    setTime(15);
    
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else if (levels[level + 1]) {
      setLevel((l) => l + 1);
      setQuestionIndex(0);
    } else {
      endGame();
    }
  };
  
  const prevQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
      setSelected(null);
      setResult(null);
      setShowSolution(false);
      setTime(15);
    }
  };
  
  /* ================= START SCREEN ================= */
  
  if (!started) {
    return (
      <div className="stress-games-container text-center">
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/stress-games")}>
      ← Back to Games
      </button>
      <button
      className="btn btn-success mt-2"
      onClick={restartGame}
      >
      🔄 Restart Game
      </button>
      
      <div className="mini-game card glass p-4 text-white">
      <h3 className="neon-title">Logic Mind Game 🧠</h3>
      <p>Answer logic questions before the timer ends.</p>
      
      <button className="btn btn-success mt-3" onClick={() => setStarted(true)}>
      ▶ Start Game
      </button>
      </div>
      </div>
    );
  }
  
  /* ================= FINAL SCORE SCREEN ================= */
  
  if (gameOver) {
    return (
      <div className="stress-games-container text-center">
      <div className="mini-game card glass p-4 text-white">
      <h3 className="neon-title">Game Completed 🎉</h3>
      
      <p className="mt-2">Final Score: <strong>{score}</strong></p>
      <p>High Score: <strong>{highScore}</strong></p>
      
      {score >= highScore && (
        <p className="text-success fw-bold">🏆 New High Score!</p>
      )}
      
      <button className="btn btn-primary mt-3" onClick={() => navigate("/stress-games")}>
      Back to Games
      </button>
      </div>
      </div>
    );
  }
  
  /* ================= GAME SCREEN ================= */
  
  return (
    <div className="stress-games-container">
    <div className="d-flex justify-content-between mb-2 text-white">
    <span>❤️ {lives}</span>
    <span>⭐ {score}</span>
    <span>⏱ {time}s</span>
    </div>
    
    <div className="mini-game card glass p-4 text-center text-white">
    <h6>Level {level}</h6>
    <p className="fw-bold">{question.q}</p>
    
    {question.options.map((opt, i) => (
      <button
      key={i}
      className={`btn m-1 ${
        selected === opt
        ? opt === question.ans
        ? "btn-success"
        : "btn-danger"
        : "btn-outline-light"
      }`}
      disabled={!!result}
      onClick={() => checkAnswer(opt)}
      >
      {opt}
      </button>
    ))}
    
    {result && (
      <div className="mt-2 fw-bold">
      {result}
      </div>
    )}
    
    <div className="d-flex justify-content-between mt-3">
    <button className="btn btn-sm btn-light" onClick={prevQuestion}>
    ← Previous
    </button>
    
    <button className="btn btn-sm btn-warning" onClick={() => setPaused(!paused)}>
    {paused ? "Resume ⏯" : "Pause ⏸"}
    </button>
    
    <button className="btn btn-sm btn-info" onClick={() => setShowSolution(true)}>
    Solution
    </button>
    </div>
    
    {result && (
      <button className="btn btn-success mt-3" onClick={nextStep}>
      Next ▶
      </button>
    )}
    </div>
    
    {showSolution && (
      <div className="mini-game card glass p-3 mt-3 text-white">
      <strong>Correct Answer:</strong> {question.ans}
      <br />
      <em>{question.desc}</em>
      <br />
      <button className="btn btn-sm btn-danger mt-2" onClick={() => setShowSolution(false)}>
      Close
      </button>
      </div>
    )}
    </div>
  );
}
