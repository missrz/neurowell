import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/BounceLogicBall.css";
import { saveValuableHistory } from "../services/api";


const SIZE = 400;
const BALL = 20;
const SPEED = 2;
const WALL = 16;

export default function BounceLogicBall() {
  const boxRef = useRef(null);
  const navigate = useNavigate();
  
  const [ball, setBall] = useState({ x: SIZE / 2, y: SIZE / 2 });
  const dirRef = useRef({ x: 1, y: 1 });
  
  const [thorn, setThorn] = useState(createThorn());
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [tap, setTap] = useState(null);
  const [score, setScore] = useState(0);
  
  /* Ball movement */
  useEffect(() => {
    if (!running || gameOver) return;
    
    const loop = setInterval(() => {
      setScore((prev) => prev + 1);   // ✅ ADD THIS LINE
      
      setBall((prev) => {
        
        let nx = prev.x + dirRef.current.x * SPEED;
        let ny = prev.y + dirRef.current.y * SPEED;
        
        if (nx <= WALL || nx >= SIZE - BALL - WALL) {
          dirRef.current.x *= -1;
        }
        if (ny <= WALL || ny >= SIZE - BALL - WALL) {
          dirRef.current.y *= -1;
        }
        
        return {
          x: Math.max(WALL, Math.min(nx, SIZE - BALL - WALL)),
          y: Math.max(WALL, Math.min(ny, SIZE - BALL - WALL))
        };
      });
    }, 16);
    
    return () => clearInterval(loop);
  }, [running, gameOver]);
  
  /* Thorn collision */
  useEffect(() => {
    if (
      Math.abs(ball.x - thorn.x) < 14 &&
      Math.abs(ball.y - thorn.y) < 14
    ) {
      setGameOver(true);
      setRunning(false);
    }
  }, [ball, thorn]);
  /* Save history when game over */
  useEffect(() => {
    console.log
    if (gameOver && running === false) {
      saveHistory();
    }
  }, [gameOver]);
  
  
  /* Change thorn every 3 sec */
  useEffect(() => {
    if (!running) return;
    
    const t = setInterval(() => {
      setThorn(createThorn());
    }, 6000);
    
    return () => clearInterval(t);
  }, [running]);
  
  function startGame() {
    setScore(0);
    setGameOver(false);
    setRunning(true);
  }
  
  function stopGame() {
    setRunning(false);
  }
  
  function restartGame() {
    setGameOver(false);
    setRunning(false);
    setBall({ x: SIZE / 2, y: SIZE / 2 });
    dirRef.current = { x: 1, y: 1 };
    setThorn(createThorn());
  }
  function goBack() {
    navigate("/stress-games");
  }
  
  function tapWall(side, e) {
    const rect = boxRef.current.getBoundingClientRect();
    
    setTap({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id: Date.now()
    });
    
    if (side === "left" || side === "right") {
      dirRef.current.x *= -1;
    }
    if (side === "top" || side === "bottom") {
      dirRef.current.y *= -1;
    }
    
    setTimeout(() => setTap(null), 300);
  }
  async function saveHistory() {
    try {
      await saveValuableHistory({
        type: "game",
        name: "Bounce Logic Ball",
        score: score
      });
      
      console.log("Game history saved");
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  }
  
  return (
    <div className="bounce-wrapper">
    <div className="top-bar">
    <button className="back-btn" onClick={goBack}>⬅ Back</button>
    </div>
    
    <h3>Bounce Logic Ball</h3>
    <p>Score: {score}</p>
    
    <div className="controls">
    <button onClick={startGame}>▶ Start</button>
    <button onClick={stopGame}>⏸ Stop</button>
    <button onClick={restartGame}>🔄 Restart</button>
    </div>
    
    <div className="arena" ref={boxRef}>
    {tap && (
      <div
      className="tap-ripple"
      style={{ left: tap.x, top: tap.y }}
      />
    )}
    
    <div className="wall top" onClick={(e) => tapWall("top", e)} />
    <div className="wall bottom" onClick={(e) => tapWall("bottom", e)} />
    <div className="wall left" onClick={(e) => tapWall("left", e)} />
    <div className="wall right" onClick={(e) => tapWall("right", e)} />
    
    <div className="ball" style={{ left: ball.x, top: ball.y }} />
    
    <div className="thorn" style={{ left: thorn.x, top: thorn.y }} />
    
    {gameOver && <div className="game-over">Game Over</div>}
    </div>
    </div>
  );
}

/* helpers */
function createThorn() {
  const margin = WALL + 6;
  const side = Math.floor(Math.random() * 4);
  
  switch (side) {
    case 0:
    return { x: Math.random() * (SIZE - 40) + 20, y: margin };
    case 1:
    return { x: SIZE - margin, y: Math.random() * (SIZE - 40) + 20 };
    case 2:
    return { x: Math.random() * (SIZE - 40) + 20, y: SIZE - margin };
    case 3:
    return { x: margin, y: Math.random() * (SIZE - 40) + 20 };
    default:
    return { x: 0, y: 0 };
  }
}
