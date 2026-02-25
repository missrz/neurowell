import React, { useState } from "react";
import { useSelector } from 'react-redux';
import "../styles/Chatbot.css";

export default function Chatbot({ fullPage = false, setRobotState }) {
  const userState = useSelector(state => state.user && state.user.user);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm NeuroWell AI. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  let API = process.env.REACT_APP_API_URL || '';
  if (!API) {
    // Node backend is running on localhost:4000 in your setup — use an absolute URL with scheme
    API = 'http://localhost:4000/api';
  } else {
    // normalize user-provided value: allow 'localhost:4000' or 'http://host' or '/api'
    API = API.trim();
    // if it looks like a host without scheme, add http://
    if (!API.startsWith('/') && !API.startsWith('http://') && !API.startsWith('https://')) {
      API = 'http://' + API;
    }
    // remove trailing slash
    API = API.replace(/\/$/, '');
  }

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    const botMsg = { from: "bot", text: "..." };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput("");

    if (setRobotState) setRobotState("thinking");

    const userId = (userState && (userState._id || userState.id || userState.email || userState.name)) || 'anonymous';
    const payload = { message: input, userId };

    (async () => {
      try {
        const res = await fetch(`${API}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const extractAnswer = (d) => {
          if (!d) return '';
          if (typeof d === 'string') return d;
          // Prefer top-level `reply` then older fields
          if (d.reply) {
            if (typeof d.reply === 'string') return d.reply;
            if (typeof d.reply === 'object') {
              return d.reply.answer || d.reply.text || d.reply.message || JSON.stringify(d.reply);
            }
          }
          return d.answer || d.text || d.message || (d.raw && d.raw.answer) || JSON.stringify(d);
        };

        const answer = extractAnswer(data);

        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { from: 'bot', text: answer };
          return copy;
        });
      } catch (err) {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { from: 'bot', text: 'Error: could not reach chat service' };
          return copy;
        });
        console.error('Chat request failed', err);
      } finally {
        if (setRobotState) setRobotState('idle');
      }
    })();
  };

  return (
    <div className={`chatbot-container ${fullPage ? "full-page" : ""}`}>
      {!open && !fullPage && (
        <button className="chatbot-btn" onClick={() => setOpen(true)} aria-label="Open chat" title="NeuroWell Assistant">🧠</button>
      )}

      {(open || fullPage) && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <h3>NeuroWell AI</h3>
            {!fullPage && <button onClick={() => setOpen(false)}>✖</button>}
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.from === "user" ? "user" : "bot"}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
