import React, { useState } from "react";
import "../styles/Chatbot.css";

export default function Chatbot({ fullPage = false, setRobotState }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm NeuroWell AI. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    const botMsg = { from: "bot", text: "Thanks for your message! I will respond soon." };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput("");

    if (setRobotState) setRobotState("thinking");
    setTimeout(() => setRobotState && setRobotState("idle"), 1500);
  };

  return (
    <div className={`chatbot-container ${fullPage ? "full-page" : ""}`}>
      {!open && !fullPage && (
        <button className="chatbot-btn" onClick={() => setOpen(true)}>🧠</button>
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
