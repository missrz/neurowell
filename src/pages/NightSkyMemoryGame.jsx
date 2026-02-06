import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NightSkyMemory.css";

const STAR_COUNT = 20;

export default function NightSkyMemoryGame() {
  const navigate = useNavigate();

  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [activeStars, setActiveStars] = useState([]);
  const [level, setLevel] = useState(1);
  const [isShowing, setIsShowing] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (started && !paused) {
      startLevel();
    }
    // eslint-disable-next-line
  }, [level, started]);

  const startLevel = () => {
    setUserInput([]);
    setIsShowing(true);

    const newStar = Math.floor(Math.random() * STAR_COUNT);
    const newSequence = [...sequence, newStar];
    setSequence(newSequence);

    let i = 0;
    const interval = setInterval(() => {
      setActiveStars([newSequence[i]]);
      i++;
      if (i >= newSequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          setActiveStars([]);
          setIsShowing(false);
        }, 500);
      }
    }, 800);
  };

  const handleStarClick = (index) => {
    if (isShowing || gameOver || paused || !started) return;

    const newInput = [...userInput, index];
    setUserInput(newInput);

    if (sequence[newInput.length - 1] !== index) {
      setGameOver(true);
      setStarted(false);
      return;
    }

    if (newInput.length === sequence.length) {
      setTimeout(() => setLevel((prev) => prev + 1), 800);
    }
  };

  const startGame = () => {
    setSequence([]);
    setLevel(1);
    setGameOver(false);
    setPaused(false);
    setStarted(true);
  };

  const stopGame = () => {
    setPaused(true);
  };

  const resetGame = () => {
    setSequence([]);
    setLevel(1);
    setGameOver(false);
    setStarted(false);
    setPaused(false);
  };

  return (
    <div className="night-game">
      <h2>🌌 Dot Memory</h2>
      <p>Level {level}</p>

      {/* CONTROL BUTTONS */}
      <div className="controls">
        {!started && <button onClick={startGame}>Start</button>}
        {started && !paused && <button onClick={stopGame}>Stop</button>}
        <button onClick={() => navigate("/stress-games")}>Back</button>
      </div>

      <div className="sky">
        {[...Array(STAR_COUNT)].map((_, i) => (
          <div
            key={i}
            className={`star ${activeStars.includes(i) ? "active" : ""}`}
            onClick={() => handleStarClick(i)}
          />
        ))}
      </div>

      {gameOver && (
        <div className="overlay">
          <p>Game Over</p>
          <button onClick={resetGame}>Restart</button>
          <button onClick={() => navigate("/stress-games")}>Back</button>
        </div>
      )}
    </div>
  );
}
