import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StressGames.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

/* ----------------- LocalStorage helpers ----------------- */
function saveBest(key, value) {
  const prev = Number(localStorage.getItem(key) || 0);
  if (value > prev) localStorage.setItem(key, value);
}
function loadBest(key) {
  return Number(localStorage.getItem(key) || 0);
}

/* ----------------- Number Click ----------------- */
function NumberClick({ onFinish }) {
  const [numbers, setNumbers] = useState(Array.from({ length: 9 }, (_, i) => i + 1));
  const [score, setScore] = useState(0);

  function handleClick(num) {
    setScore((s) => {
      const newScore = s + 1;
      saveBest("numberClick", newScore);
      onFinish(newScore);
      return newScore;
    });
    setNumbers((prev) => prev.filter((n) => n !== num));
  }

  return (
    <div className="mini-game card glass p-3 text-center">
      <h5 className="text-white">Number Click 🔢</h5>
      <div className="d-flex flex-wrap justify-content-center gap-2">
        {numbers.map((n) => (
          <button key={n} className="btn btn-light btn-sm" onClick={() => handleClick(n)}>
            {n}
          </button>
        ))}
      </div>
      <div className="mt-2 text-white">Score: {score} | Best: {loadBest("numberClick")}</div>
    </div>
  );
}

/* ----------------- Reaction Game ----------------- */
function ReactionGame({ onFinish }) {
  const [color, setColor] = useState("#ff6b6b");
  const [score, setScore] = useState(0);
  const timeoutRef = useRef(null);

  function startRound() {
    const delay = Math.random() * 2000 + 1000;
    timeoutRef.current = setTimeout(() => setColor("#2bd1ff"), delay);
  }

  function handleClick() {
    if (color === "#2bd1ff") {
      const newScore = score + 1;
      setScore(newScore);
      saveBest("reaction", newScore);
      onFinish(newScore);
    }
    setColor("#ff6b6b");
    startRound();
  }

  useEffect(() => {
    startRound();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="mini-game card glass p-3 text-center">
      <h5 className="text-white">Reaction Game ⚡</h5>
      <div
        onClick={handleClick}
        style={{
          margin: "20px auto",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: color,
          cursor: "pointer",
          boxShadow: `0 8px 24px ${color}, 0 0 18px inset ${color}`,
        }}
      />
      <div className="text-white">Score: {score} | Best: {loadBest("reaction")}</div>
    </div>
  );
}

/* ----------------- Color Tap Game ----------------- */
function ColorTap({ onFinish }) {
  const colors = ["#ff6b6b", "#60ffa6", "#2bd1ff", "#ffd93d"];
  const target = "#2bd1ff";
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const [score, setScore] = useState(0);
  const [pulse, setPulse] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentColor(colors[Math.floor(Math.random() * colors.length)]);
    }, 700);
    return () => clearInterval(intervalRef.current);
  }, []);

  function handleTap() {
    if (currentColor === target) {
      const newScore = score + 1;
      setScore(newScore);
      setPulse(true);
      saveBest("colorTap", newScore);
      onFinish(newScore);
      setTimeout(() => setPulse(false), 500);
    }
  }

  return (
    <div className="mini-game card glass p-3 text-center">
      <h5 className="text-white mb-3">Color Tap 🎯</h5>
      <div
        onClick={handleTap}
        style={{
          margin: "20px auto",
          width: pulse ? "140px" : "120px",
          height: pulse ? "140px" : "120px",
          borderRadius: "50%",
          background: currentColor,
          border: currentColor === target ? "4px solid #2bd1ff" : "4px solid #333",
          cursor: "pointer",
          boxShadow: `0 8px 24px ${currentColor}, 0 0 18px inset ${currentColor}`,
          transition: "all 0.3s ease",
        }}
      />
      <div className="text-white mt-2 mb-1" style={{ fontSize: "1rem", fontWeight: "bold" }}>
        Tap the circle when it is <span style={{ color: "#2bd1ff" }}>blue 🎯</span>
      </div>
      <div className={`score ${pulse ? "pulse" : ""} text-white`} style={{ fontSize: "1.1rem" }}>
        Score: {score} | Best: {loadBest("colorTap")}
      </div>
    </div>
  );
}

/* ----------------- Memory Match ----------------- */
function MemoryMatch({ onFinish }) {
  const symbols = ["🍎", "🍌", "🍇", "🍓", "🍍", "🥝"];
  const [cards, setCards] = useState([...symbols, ...symbols].sort(() => Math.random() - 0.5));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(Array(cards.length).fill(false));
  const [score, setScore] = useState(0);

  function handleFlip(index) {
    if (flipped.includes(index) || matched[index]) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length % 2 === 0) {
      const [first, second] = newFlipped.slice(-2);
      if (cards[first] === cards[second]) {
        const newMatched = [...matched];
        newMatched[first] = true;
        newMatched[second] = true;
        setMatched(newMatched);
        const newScore = score + 1;
        setScore(newScore);
        saveBest("memoryMatch", newScore);
        onFinish(newScore);
      } else {
        setTimeout(() => {
          setFlipped((prev) => prev.filter((i) => i !== first && i !== second));
        }, 800);
      }
    }
  }

  return (
    <div className="mini-game card glass p-3 text-center">
      <h5 className="text-white">Memory Match 🧠</h5>
      <div className="d-flex flex-wrap justify-content-center gap-2">
        {cards.map((symbol, idx) =>
          matched[idx] ? (
            <div key={idx} style={{ width: "50px", height: "50px" }} />
          ) : (
            <div
              key={idx}
              onClick={() => handleFlip(idx)}
              style={{
                width: "50px",
                height: "50px",
                background: flipped.includes(idx) ? "#2bd1ff" : "#555",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                cursor: "pointer",
                borderRadius: "6px",
                fontSize: "24px",
                fontWeight: "bold",
                transition: "0.3s",
              }}
            >
              {flipped.includes(idx) ? symbol : "?"}
            </div>
          )
        )}
      </div>
      <div className="mt-2 text-white">Score: {score} | Best: {loadBest("memoryMatch")}</div>
    </div>
  );
}


/* ----------------- Main Page ----------------- */
export default function StressGames() {
  const [currentGame, setCurrentGame] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const navigate = useNavigate();

  function handleFinish(score) {
    setTotalScore((s) => s + score);
  }

  const games = [
    { id: "numberClick", title: "Number Click", component: <NumberClick onFinish={handleFinish} />, emoji: "🔢" },
    { id: "reaction", title: "Reaction Game", component: <ReactionGame onFinish={handleFinish} />, emoji: "⚡" },
    { id: "colorTap", title: "Color Tap", component: <ColorTap onFinish={handleFinish} />, emoji: "🎨" },
    { id: "memoryMatch", title: "Memory Match", component: <MemoryMatch onFinish={handleFinish} />, emoji: "🧠" },
  ];

  return (
    <div className="stress-games-container text-light p-4">
      <button className="mood-close-btn" onClick={() => navigate("/dashboard")} title="Go to Dashboard">
        ✕
      </button>

      <div className="container">
        {!currentGame ? (
          <>
            <h1 className="text-center mb-3 animate__animated animate__fadeInDown neon-title text-white">
              Stress Relief Games
            </h1>
            <p className="text-center text-white mb-4">
              Quick, fun mini-games to relax, focus, and train your mind.
            </p>
            <div className="row g-3">
              {games.map((g) => (
                <div key={g.id} className="col-12 col-md-6 col-lg-3">
                  <div className="card game-card p-3 h-100 animated-card" onClick={() => setCurrentGame(g)}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="game-emoji neon-emoji">{g.emoji}</div>
                      <div>
                        <h5 className="mb-1 text-white">{g.title}</h5>
                        <div className="small text-muted">Best: {loadBest(g.id)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 d-flex align-items-center">
              <button className="btn btn-outline-light me-3" onClick={() => setCurrentGame(null)}>
                ← Back to Games
              </button>
              <h3 className="mb-0 text-white">{currentGame.title}</h3>
            </div>
            <div className="mb-3 animate__animated animate__fadeInUp">{currentGame.component}</div>
          </>
        )}
      </div>
    </div>
  );
}
