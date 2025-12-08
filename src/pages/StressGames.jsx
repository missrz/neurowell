// src/pages/StressGames.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StressGames.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

/*
  Upgraded StressGames.jsx (Combination theme: Neon + Soft + Gaming)
  - Includes 5 games with animations
  - Keeps original game logic & localStorage bests
*/

function saveBest(key, value) {
  const prev = Number(localStorage.getItem(key) || 0);
  if (value > prev) localStorage.setItem(key, value);
}
function loadBest(key) {
  return Number(localStorage.getItem(key) || 0);
}

/* ---------------- Memory Grid Challenge ---------------- */
function MemoryGridChallenge({ onFinish }) {
  const [sequence, setSequence] = useState([]);
  const [player, setPlayer] = useState([]);
  const [round, setRound] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | showing | input | success | fail
  const tilesCount = 6; // 2x3
  const difficultyDelay = 700;

  useEffect(() => {
    startRound();
    // eslint-disable-next-line
  }, []);

  function startRound() {
    const next = [...sequence, Math.floor(Math.random() * tilesCount)];
    setSequence(next);
    setPlayer([]);
    setRound((r) => r + 1);
    setStatus("showing");
    showSequence(next);
  }

  async function showSequence(seq) {
    for (let i = 0; i < seq.length; i++) {
      setActiveIndex(seq[i]);
      await new Promise((res) => setTimeout(res, Math.max(320, difficultyDelay - seq.length * 20)));
      setActiveIndex(null);
      await new Promise((res) => setTimeout(res, 180));
    }
    setStatus("input");
  }

  function handleTileClick(i) {
    if (status !== "input") return;
    setPlayer((p) => {
      const newP = [...p, i];
      const idx = newP.length - 1;
      if (sequence[idx] !== i) {
        setStatus("fail");
        saveBest("memory_best", round - 1);
        onFinish(round - 1);
        return newP;
      }
      if (newP.length === sequence.length) {
        setStatus("success");
        setTimeout(() => startRound(), 700);
      }
      return newP;
    });
  }

  return (
    <div className="mini-game card glass p-3 animated-card">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Memory Grid</h5>
        <small className="text-muted">Round: {round - (status === "fail" ? 1 : 0)}</small>
      </div>

      <p className="text-muted small">Watch the sequence and repeat it — rounds grow!</p>

      <div className="memory-grid d-grid gap-2" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {Array.from({ length: tilesCount }).map((_, i) => {
          const wrongHighlight = status === "fail" && sequence[player.length] === i;
          return (
            <button
              key={i}
              className={`memory-tile btn ${activeIndex === i ? "active" : ""} ${wrongHighlight ? "wrong" : ""}`}
              onClick={() => handleTileClick(i)}
            >
              <span className="tile-dot" />
            </button>
          );
        })}
      </div>

      <div className="mt-3 d-flex gap-2">
        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => {
            setSequence([]);
            setRound(0);
            startRound();
          }}
        >
          Restart
        </button>

        <div className="ms-auto">
          {status === "fail" && <span className="text-warning">Wrong! Final: {round - 1}</span>}
          {status === "success" && <span className="text-success">Nice — next round...</span>}
          {status === "input" && <span className="text-info">Your turn</span>}
        </div>
      </div>

      <small className="d-block text-muted mt-2">Best: {loadBest("memory_best")}</small>
    </div>
  );
}

/* ---------------- Breathing Bubble ---------------- */
function BreathingBubble({ onFinish }) {
  const [mode, setMode] = useState("4-4-4");
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("inhale"); // inhale | hold | exhale
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);

  const modes = {
    "4-4-4": { inhale: 4, hold: 4, exhale: 4 },
    "4-7-8": { inhale: 4, hold: 7, exhale: 8 },
    box: { inhale: 4, hold: 4, exhale: 4 },
  };

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      setPhase("inhale");
      setCount(0);
      return;
    }
    const steps = modes[mode];
    let stageOrder = ["inhale", "hold", "exhale"];
    let idx = 0;
    let sec = steps[stageOrder[idx]];
    setPhase(stageOrder[idx]);
    setCount(sec);
    intervalRef.current = setInterval(() => {
      sec -= 1;
      if (sec <= 0) {
        idx = (idx + 1) % 3;
        sec = steps[stageOrder[idx]];
        setPhase(stageOrder[idx]);
      }
      setCount(sec);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  return (
    <div className="mini-game card glass p-3 d-flex flex-column align-items-center animated-card">
      <div className="w-100 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Breathing Bubble</h5>
        <small className="text-muted">Calm down in 2–4 minutes</small>
      </div>

      <div className="breathing-area my-3 d-flex flex-column align-items-center">
        <div className={`bubble ${phase}`} />
        <div className="mt-2 text-center">
          <div className="fw-bold">{phase.toUpperCase()}</div>
          <div className="text-muted small">Count: {count}s</div>
        </div>
      </div>

      <div className="d-flex gap-2 w-100">
        <select className="form-select form-select-sm" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="4-4-4">4-4-4 (Calm)</option>
          <option value="4-7-8">4-7-8 (Relax)</option>
          <option value="box">Box breathing (4-4-4)</option>
        </select>
        <button className={`btn ${running ? "btn-danger" : "btn-primary"}`} onClick={() => setRunning((r) => !r)}>
          {running ? "Stop" : "Start"}
        </button>
      </div>

      <small className="text-muted mt-2">Tip: Breathe through nose, exhale softly.</small>
    </div>
  );
}

/* ---------------- Reaction Time Tester ---------------- */
function ReactionTimeTester({ onFinish }) {
  const [state, setState] = useState("ready"); // ready | wait | go | result
  const [timeStart, setTimeStart] = useState(null);
  const [reaction, setReaction] = useState(null);
  const timeoutRef = useRef(null);

  function startTest() {
    setReaction(null);
    setState("wait");
    const delay = 800 + Math.floor(Math.random() * 1400);
    timeoutRef.current = setTimeout(() => {
      setState("go");
      setTimeStart(performance.now());
    }, delay);
  }

  function handleClick() {
    if (state === "ready") {
      startTest();
    } else if (state === "wait") {
      clearTimeout(timeoutRef.current);
      setState("ready");
      setReaction("Too early! Try again.");
    } else if (state === "go") {
      const rt = Math.round(performance.now() - timeStart);
      setReaction(`${rt} ms`);
      setState("result");
      const prev = Number(localStorage.getItem("reaction_best") || 9999);
      if (rt < prev) localStorage.setItem("reaction_best", rt);
      onFinish(rt);
    } else if (state === "result") {
      setState("ready");
      setReaction(null);
    }
  }

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="mini-game card glass p-3 text-center animated-card">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Reaction Tester</h5>
        <small className="text-muted">Test your reflexes</small>
      </div>

      <div className={`reaction-box my-3 ${state}`} onClick={handleClick} role="button" tabIndex={0}>
        {state === "ready" && <div className="text-muted">Click to start</div>}
        {state === "wait" && <div className="text-muted">Wait for green...</div>}
        {state === "go" && <div className="fw-bold">CLICK!</div>}
        {state === "result" && <div className="fw-bold">Result: {reaction}</div>}
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-outline-light btn-sm" onClick={() => { setReaction(null); setState("ready"); }}>
          Reset
        </button>
        <div className="ms-auto text-muted small">Best: {localStorage.getItem("reaction_best") || "—"} ms</div>
      </div>
    </div>
  );
}

/* ---------------- Emotion Guessing Game ---------------- */
const EMOTIONS = [
  { name: "Happy", emoji: "😄", hint: "Smile, eyes crinkled" },
  { name: "Sad", emoji: "😔", hint: "Downturned mouth" },
  { name: "Surprised", emoji: "😲", hint: "Wide eyes" },
  { name: "Angry", emoji: "😠", hint: "Furrowed brow" },
  { name: "Neutral", emoji: "😐", hint: "No strong expression" },
];

function EmotionGuessingGame({ onFinish }) {
  const [target, setTarget] = useState(null);
  const [choices, setChoices] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => startRound(), []);
  function startRound() {
    const t = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    const shuffled = [...EMOTIONS].sort(() => 0.5 - Math.random()).slice(0, 4);
    if (!shuffled.some((s) => s.name === t.name)) shuffled[0] = t;
    setTarget(t);
    setChoices(shuffled.sort(() => 0.5 - Math.random()));
  }

  function handleChoice(choice) {
    if (!target) return;
    if (choice.name === target.name) {
      setScore((s) => s + 1);
      onFinish(score + 1);
      setTimeout(startRound, 600);
    } else {
      setTimeout(startRound, 600);
    }
  }

  return (
    <div className="mini-game card glass p-3 animated-card">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Emotion Guessing</h5>
        <small className="text-muted">Read the face — choose emotion</small>
      </div>

      <div className="d-flex flex-column align-items-center my-3">
        <div className="face-plate mb-2">{target ? target.emoji : "🙂"}</div>
        <div className="text-muted small mb-2">Hint: {target?.hint}</div>

        <div className="d-flex gap-2 flex-wrap justify-content-center">
          {choices.map((c, idx) => (
            <button key={idx} className="btn btn-outline-light neon-btn" onClick={() => handleChoice(c)}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">Score: {score}</small>
        <button className="btn btn-sm btn-outline-light" onClick={() => { setScore(0); startRound(); }}>
          Reset
        </button>
      </div>
    </div>
  );
}

/* ---------------- Focus Dot ---------------- */
function FocusDot({ onFinish }) {
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [timer, setTimer] = useState(20);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            saveBest("focus_best", score);
            onFinish(score);
            return 0;
          }
          return t - 1;
        });
        setPos({ x: Math.random() * 80 + 8, y: Math.random() * 60 + 8 });
      }, 1200);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function handleClick() {
    if (!running) return;
    setScore((s) => s + 1);
  }

  function start() {
    setScore(0);
    setTimer(20);
    setRunning(true);
  }

  return (
    <div className="mini-game card glass p-3 position-relative animated-card">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Focus Dot</h5>
        <small className="text-muted">Keep tapping the dot</small>
      </div>

      <div className="focus-area my-3 position-relative">
        <div
          className={`focus-dot neon ${running ? "pulse" : ""}`}
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          onClick={handleClick}
        />
        {!running && (
          <div className="focus-overlay d-flex flex-column align-items-center justify-content-center">
            <button className="btn btn-primary start-btn" onClick={start}>
              Start 20s
            </button>
            <small className="text-muted mt-2">Best: {loadBest("focus_best")}</small>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center mt-2">
        <small className="text-muted">Time: {timer}s</small>
        <small className="text-muted">Score: {score}</small>
      </div>
    </div>
  );
}

/* ---------------- Main StressGames Page ---------------- */
export default function StressGames() {
  const [currentGame, setCurrentGame] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const navigate = useNavigate();

  function handleFinish(gameKey, score) {
    setTotalScore((s) => s + Number(score || 0));
    switch (gameKey) {
      case "memory":
        saveBest("memory_best", score);
        break;
      case "reaction":
        const prev = Number(localStorage.getItem("reaction_best") || 9999);
        if (score < prev) localStorage.setItem("reaction_best", score);
        break;
      case "emotion":
        saveBest("emotion_best", score);
        break;
      case "focus":
        saveBest("focus_best", score);
        break;
      default:
        break;
    }
  }

  const games = [
    {
      id: "memory",
      title: "Memory Grid Challenge",
      desc: "Watch and repeat the pattern. Tests your working memory!",
      component: <MemoryGridChallenge onFinish={(score) => handleFinish("memory", score)} />,
      emoji: "🧠",
    },
    {
      id: "breathing",
      title: "Breathing Bubble (Calm)",
      desc: "Guided breathing with an expanding bubble to lower stress.",
      component: <BreathingBubble onFinish={(score) => handleFinish("breathing", score)} />,
      emoji: "🫧",
    },
    {
      id: "reaction",
      title: "Reaction Time Tester",
      desc: "Measure your reaction time — fast reflexes indicate alertness.",
      component: <ReactionTimeTester onFinish={(score) => handleFinish("reaction", score)} />,
      emoji: "⚡",
    },
    {
      id: "emotion",
      title: "Emotion Guessing Game",
      desc: "Read the face and pick the right emotion (train empathy).",
      component: <EmotionGuessingGame onFinish={(score) => handleFinish("emotion", score)} />,
      emoji: "😊",
    },
    {
      id: "focus",
      title: "Focus Dot (Concentration)",
      desc: "Tap the moving dot fast — trains focused attention.",
      component: <FocusDot onFinish={(score) => handleFinish("focus", score)} />,
      emoji: "🎯",
    },
  ];

  return (
    <div className="stress-games-container text-light p-4" style={{ background: "#080812", minHeight: "100vh" }}>
      <button className="mood-close-btn btn btn-danger" onClick={() => navigate("/dashboard")}>
        ✕
      </button>
      <div className="container">
        {!currentGame ? (
          <>
            <h1 className="text-center mb-3 animate__animated animate__fadeInDown neon-title">Stress Relief Games</h1>
            <p className="text-center text-muted mb-4">Quick, fun mini-games to relax, focus, and train your mind.</p>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Total Score (session): {totalScore}</h5>
              <div>
                <small className="text-muted me-2">Memory Best: {loadBest("memory_best")}</small>
                <small className="text-muted me-2">Focus Best: {loadBest("focus_best")}</small>
                <small className="text-muted">Reaction Best: {localStorage.getItem("reaction_best") || "—"} ms</small>
              </div>
            </div>

            <div className="row g-3">
              {games.map((g) => (
                <div key={g.id} className="col-12 col-md-6 col-lg-4">
                  <div className="card game-card p-3 h-100 animated-card" onClick={() => setCurrentGame(g)}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="game-emoji neon-emoji">{g.emoji}</div>
                      <div>
                        <h5 className="mb-1">{g.title}</h5>
                        <p className="small text-muted mb-0">{g.desc}</p>
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
              <h3 className="mb-0">{currentGame.title}</h3>
            </div>

            <div className="mb-3 animate__animated animate__fadeInUp">{currentGame.component}</div>
          </>
        )}
      </div>
    </div>
  );
}
