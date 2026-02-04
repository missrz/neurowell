import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/BubbleMerge.css";

export default function RainDropGame() {
  const [drops, setDrops] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("rain_high_score")) || 0
  );
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [level, setLevel] = useState(1);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const navigate = useNavigate();

  const rainAreaRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const dropId = useRef(0);

  /* Disable scroll on mobile */
  useEffect(() => {
    document.body.style.overflow = gameActive ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [gameActive]);

  /* Create drop */
  const createDrop = (width) => ({
    id: dropId.current++,
    x: Math.random() * (width - 40),
    y: -100,
    speed: 5.8 + Math.random() * 1,
    size: 4 + Math.random() * 0.8,
    opacity: 0.9 + Math.random() * 0.4,
    color: Math.random() > 0.25 ? "blue" : "red",
    caught: false, 
  });

  /* Spawn drops */
  useEffect(() => {
    if (!gameActive) return;

    const spawn = () => {
      const area = rainAreaRef.current;
      if (!area) return;

      setDrops((prev) =>
        prev.length < 45 ? [createDrop(area.offsetWidth), ...prev] : prev
      );
    };

    const interval = setInterval(spawn, 90);
    spawn();

    return () => clearInterval(interval);
  }, [gameActive]);

  /* Smooth animation */
  const animate = useCallback(
    (time) => {
      if (!gameActive) return;

      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      const area = rainAreaRef.current;
      if (!area) return;
      const height = area.offsetHeight;

      setDrops((prev) =>
  prev
    .map((d) => ({
  ...d,
  y: d.y + d.speed * speedMultiplier * delta,
}))

    .filter((d) => d.y < height + 120 && !d.caught)
);


      animationRef.current = requestAnimationFrame(animate);
    },
    [gameActive, speedMultiplier]
  );

  useEffect(() => {
    if (gameActive) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameActive, animate]);

  /* Timer + difficulty */
  useEffect(() => {
    if (!gameActive) return;

    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
      const elapsed = 60 - timeLeft;

      if (elapsed > 0 && elapsed % 15 === 0) {
        setSpeedMultiplier((s) => s * 1.5);
      }

      if (elapsed > 0 && elapsed % 25 === 0) {
        setLevel((l) => l + 1);
      }

      return () => clearTimeout(t);
    } else {
      setGameActive(false);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("rain_high_score", score);
      }
    }
  }, [timeLeft, gameActive, score, highScore]);

  /* Catch drop */
  const catchDrop = (id) => {
  setDrops((prev) =>
    prev.map((d) =>
      d.id === id ? { ...d, caught: true } : d
    )
  );

  
    setDrops((prev) => prev.filter((d) => d.id !== id));
 

  const drop = drops.find((d) => d.id === id);
  if (drop) {
    setScore((s) =>
      Math.max(0, s + (drop.color === "blue" ? 10 : -5))
    );
  }
};


  const startGame = () => {
    setGameActive(true);
    setTimeLeft(60);
    setScore(0);
    setDrops([]);
    setLevel(1);
    setSpeedMultiplier(1);
    dropId.current = 0;
  };

  if (!gameActive) {
    return (
      <div className="rain-game-container">
        <div className="start-screen">
          <h1>
            {timeLeft === 0 ? "⏱️ Game Over" : "🌧️ Rain Drop Catcher"}
          </h1>
          <p>🏆 High Score: {highScore}</p>
          <button className="start-btn" onClick={startGame}>
            START RAIN 🌧️
          </button>
          
        </div>
        <button
  className="back-btn"
  onClick={() => navigate("/stress-games")}
>
  ⬅ Back
</button>

      </div>
    );
  }

  return (
    <div className="rain-game-container">
      <div className="info-bar">
        <div>Score: {score}</div>
        <div>High: {highScore}</div>
        <div>Level: {level}</div>
        <div>Time: {timeLeft}s</div>
      </div>

      <div className="rain-area" ref={rainAreaRef} style={{ touchAction: "none" }}
        style={{
  touchAction: "none",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
}}>

        <div className="sky-bg"></div>

       {drops.map((d) => (
  <div
    key={d.id}
    className={`rain-drop ${d.color}`}
    style={{
      transform: `translate3d(${d.x}px, ${Math.round(d.y)}px, 0)`,
      fontSize: `${d.size}rem`,
      opacity: d.opacity,
      pointerEvents: d.caught ? "none" : "auto",
      willChange: "transform",
      pointerEvents: "auto",
    }}
    onPointerDown={(e) => {
      e.preventDefault();
      // e.stopPropagation();
      catchDrop(d.id);
    }}
  >
    💧
  </div>
))}


      </div>
    </div>
  );
}
