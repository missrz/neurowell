import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { saveValuableHistory } from "../services/api";
import "../styles/SnakeGame.css";

const INITIAL_SIZE = 20;
const LEVEL_GROWTH = 4;
const FOOD_TARGET = 10;

export default function SnakeGame() {
  const [gridSize, setGridSize] = useState(INITIAL_SIZE);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [level, setLevel] = useState(1);
  const [foodCount, setFoodCount] = useState(0);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();
  
  const SPEEDS = {
    slow: 180,
    medium: 120,
    fast: 80,
  };
  
  const [speed, setSpeed] = useState("medium");
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem("snakeHighScores");
    return saved ? JSON.parse(saved) : { slow: 0, medium: 0, fast: 0 };
  });
  const [levelUpFlash, setLevelUpFlash] = useState(false);
  
  const moveRef = useRef(dir);
  moveRef.current = dir;
  
  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 5, y: 5 });
    setDir({ x: 1, y: 0 });
    setGridSize(INITIAL_SIZE);
    setLevel(1);
    setFoodCount(0);
    setScore(0);
    setGameOver(false);
    setRunning(true); // start the game immediately
  };
  const randomFood = (size, snakeBody) => {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * size),
        y: Math.floor(Math.random() * size),
      };
    } while (snakeBody.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
  };
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    
    const onTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    };
    
    const onTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const diffX = touch.clientX - startX;
      const diffY = Math.abs(touch.clientY - startY);
      
      // 👉 Swipe from LEFT edge to RIGHT
      if (startX < 40 && diffX > 100 && diffY < 80) {
        setRunning(false); // pause game
        navigate("/stress-games");
      }
    };
    
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);
  
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowUp") setDir({ x: 0, y: -1 });
      if (e.key === "ArrowDown") setDir({ x: 0, y: 1 });
      if (e.key === "ArrowLeft") setDir({ x: -1, y: 0 });
      if (e.key === "ArrowRight") setDir({ x: 1, y: 0 });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  
  useEffect(() => {
    if (!running) return;
    
    const loop = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const newHead = {
          x: head.x + moveRef.current.x,
          y: head.y + moveRef.current.y,
        };
        
        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.y < 0 ||
          newHead.x >= gridSize ||
          newHead.y >= gridSize
        ) {
          setRunning(false);
          setGameOver(true);
          
          setHighScores((prev) => {
            const updated = {
              ...prev,
              [speed]: Math.max(prev[speed], score),
            };
            localStorage.setItem("snakeHighScores", JSON.stringify(updated));
            return updated;
          });
          
          return prev;
        }
        
        
        const newSnake = [newHead, ...prev];
        
        // 🐍 SELF COLLISION (touch own body = game over)
        if (prev.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setRunning(false);
          
          setHighScores((prevScores) => {
            const updated = {
              ...prevScores,
              [speed]: Math.max(prevScores[speed], score),
            };
            localStorage.setItem("snakeHighScores", JSON.stringify(updated));
            return updated;
          });
          
          return prev;
        }
        
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFoodCount((c) => c + 1);
          setFood(randomFood(gridSize, newSnake));
        } else {
          newSnake.pop();
        }
        
        return newSnake;
      });
    }, SPEEDS[speed]);
    
    return () => clearInterval(loop);
  }, [running, food, gridSize, speed, score]);
  
  useEffect(() => {
    if (gameOver) {
      // 🔥 SAVE GAME HISTORY TO DATABASE
      const saveGame = async () => {
        try {
          await saveValuableHistory({
            type: "game",
            name: "Snake Game",
            score: score,
          });
          console.log("Snake game history saved");
        } catch (error) {
          console.error("Failed to save history:", error);
        }
      };
      
      saveGame();
      
      // 🏆 Update High Score
      setHighScores((prev) => {
        const updated = {
          ...prev,
          [speed]: Math.max(prev[speed], score),
        };
        localStorage.setItem("snakeHighScores", JSON.stringify(updated));
        return updated;
      });
    }
  }, [gameOver]);
  
  
  // ✅ PUT LEVEL-UP EFFECT RIGHT HERE
  useEffect(() => {
    if (foodCount === FOOD_TARGET) {
      setRunning(false);
      setLevelUpFlash(true);
      
      setTimeout(() => {
        setLevel((l) => l + 1);
        setFoodCount(0);
        setGridSize((s) => s + LEVEL_GROWTH);
        setFood(randomFood(gridSize + LEVEL_GROWTH, snake));
        setLevelUpFlash(false);
        setRunning(true);
      }, 1000);
    }
  }, [foodCount]);
  
  return (
    <div className="snake-wrapper text-white">
    <h2 className="neon-title">🐍 Expanding Snake</h2>
    
    <p>
    Level: {level} | Score: {score} | Foods: {foodCount}/{FOOD_TARGET}
    </p>
    <p>
    🏆 High Score ({speed}): {highScores[speed]}
    </p>
    <p>
    ⚡ Speed Mode: <b>{speed.toUpperCase()}</b>
    </p>
    
    <div className="snake-game-row">
    
    <div className="speed-toggle">
    
    <button
    className={speed === "slow" ? "active" : ""}
    onClick={() => setSpeed("slow")}
    >
    🐢 Slow
    </button>
    <button
    className={speed === "medium" ? "active" : ""}
    onClick={() => setSpeed("medium")}
    >
    🚶 Medium
    </button>
    <button
    className={speed === "fast" ? "active" : ""}
    onClick={() => setSpeed("fast")}
    >
    ⚡ Fast
    </button>
    
    
    </div>
    
    {/* GRID */}
    <div
    className={`snake-board ${levelUpFlash ? "level-up-flash" : ""}`}
    style={{
      gridTemplateColumns: `repeat(${gridSize}, 20px)`,
      gridTemplateRows: `repeat(${gridSize}, 20px)`,
    }}
    >
    
    {[...Array(gridSize * gridSize)].map((_, i) => {
      const x = i % gridSize;
      const y = Math.floor(i / gridSize);
      
      const isSnake = snake.some((s) => s.x === x && s.y === y);
      const isFood = food.x === x && food.y === y;
      
      return (
        <div
        key={i}
        className={`cell ${isSnake ? "snake" : ""} ${
          isFood ? "food" : ""
        }`}
        />
      );
    })}
    </div>
    
    {/* CONTROLS */}
    
    <div className="snake-controls">
    
    {/* START button: only when game hasn't started and not game over */}
    {!running && !gameOver && (
      <button
      className="btn btn-neon mb-2"
      onClick={() => setRunning(true)}
      >
      ▶ Start
      </button>
    )}
    
    {/* PAUSE button: only when game is running */}
    {running && (
      <button
      className="btn btn-warning mb-2"
      onClick={() => setRunning(false)}
      >
      ⏸ Pause
      </button>
    )}
    
    {/* RESUME button: only when paused and not game over */}
    {!running && !gameOver && (
      <button
      className="btn btn-outline-info mb-2"
      onClick={() => setRunning(true)}
      >
      🔁 Resume
      </button>
    )}
    {/* RESTART button: only when game is over */}
    {gameOver && (
      <button
      className="btn btn-danger mb-2"
      onClick={resetGame}
      >
      🔄 Play Again
      </button>
    )}
    <button
    className="btn btn-outline-light mb-3"
    onClick={() => navigate("/stress-games")}
    >
    ⬅ Back to Stress Games
    </button>
    
    </div>
    
    
    </div>
    
    {/* MOBILE CONTROLLER */}
    <div className="mobile-controller">
    <button onClick={() => setDir({ x: 0, y: -1 })}>⬆️</button>
    <div>
    <button onClick={() => setDir({ x: -1, y: 0 })}>⬅️</button>
    <button onClick={() => setDir({ x: 1, y: 0 })}>➡️</button>
    </div>
    <button onClick={() => setDir({ x: 0, y: 1 })}>⬇️</button>
    </div>
    </div>
  );
  
}
