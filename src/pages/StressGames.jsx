import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StressGames.css";

export default function StressGames() {
  const navigate = useNavigate();

  const goTo = (path) => navigate(path);

  return (
    <div className="stress-games-container text-white">
      <h2 className="text-center neon-title mb-4">Mind Games 🎮</h2>
<button
  className="btn btn-outline-light mb-3"
  onClick={() => navigate("/dashboard")}
>
  ⬅ Back to Feature
</button>
      <div className="row g-4 justify-content-center">
       

        {/* CODE BREAKER GAME */}
        <div className="col-12 col-md-4">
          <div
            className="game-card p-4 text-center"
            role="button"
            tabIndex={0}
            onClick={() => goTo("/stress-games/code-breaker")}
            onKeyDown={(e) =>
              e.key === "Enter" && goTo("/stress-games/code-breaker")
            }
          >
            <div className="neon-emoji mb-2">🧩</div>
            <h5>Code Breaker</h5>
            <p className="small text-muted">Patterns • Logic • Decode</p>
          </div>
        </div>

        {/* BUBBLE MERGE GAME */}
        <div className="col-12 col-md-4">
          <div
            className="game-card p-4 text-center"
            role="button"
            tabIndex={0}
            onClick={() => goTo("/stress-games/bubble-merge")}
            onKeyDown={(e) =>
              e.key === "Enter" && goTo("/stress-games/bubble-merge")
            }
          >
            <div className="neon-emoji mb-2">🫧</div>
            <h5>Rain Drop</h5>
            <p className="small text-muted">Relax • Merge • Numbers</p>
          </div>
        </div>
        {/* SNAKE GAME */}
<div className="col-12 col-md-4">
  <div
    className="game-card p-4 text-center"
    role="button"
    tabIndex={0}
    onClick={() => goTo("/stress-games/snake")}
    onKeyDown={(e) =>
      e.key === "Enter" && goTo("/stress-games/snake")
    }
  >
    <div className="neon-emoji mb-2">🐍</div>
    <h5>Expanding Snake</h5>
    <p className="small text-muted">Levels • Growing Map • Chill Play</p>
  </div>
</div>
 {/* BOUNCE LOGIC */}
<div className="col-12 col-md-4">
  <div
    className="game-card p-4 text-center"
    role="button"
    tabIndex={0}
    onClick={() => goTo("/stress-games/ball")}
    onKeyDown={(e) =>
      e.key === "Enter" && goTo("/stress-games/ball")
    }
  >
    <div className="neon-emoji mb-2">⚪↔️🧱 </div>
    <h5>Bouncing Ball</h5>
    <p className="small text-muted">
      Mindfulness • Creativity • Calm</p>
  </div>
</div>

      </div>
    </div>
  );
}
