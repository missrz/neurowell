import React, { useState, useRef } from "react";
import { Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Chat.css";

import robotGif from "../assets/a--2.gif";
import sparkleGif from "../assets/ai-1.gif";
import { sendChat } from "../services/api";
import { useEffect, useRef as useRef2 } from "react";

export default function Chat() {
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s.user.user);
  const currentToken = useSelector((s) => s.user.token);

  if (!currentToken) return <Navigate to="/login" />;

  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const recognitionRef = useRef(null);
  const micTimeoutRef = useRef(null);
  const messagesRef = useRef(null);
  const endRef = useRef2(null);

  const handleClose = () => navigate("/dashboard");

  const speakFunc = (text) => {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-GB";
    window.speechSynthesis.speak(utter);
  };

  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Browser does not support voice input");
      return;
    }
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.continuous = false;

    recognitionRef.current.onresult = (e) => {
      const command = e.results[0][0].transcript;
      handleVoiceResult(command);
      stopVoiceInput();
    };
    recognitionRef.current.onend = () => stopVoiceInput();

    recognitionRef.current.start();
    setIsListening(true);

    micTimeoutRef.current = setTimeout(() => recognitionRef.current && recognitionRef.current.stop(), 15000);
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    clearTimeout(micTimeoutRef.current);
    setIsListening(false);
  };

  const handleMicClick = () => {
    if (!isListening) startVoiceInput();
    else stopVoiceInput();
  };

  const handleVoiceResult = (text) => {
    if (!text) return;
    sendMessage(text);
  };

  const sendMessage = async (msg) => {
    if (!msg || sending) return;
    const trimmed = msg.trim();
    if (!trimmed) return;

    // Require authentication
    if (!currentToken) {
      setMessages((m) => [...m, { from: 'bot', text: 'Please login to continue.' }]);
      setTimeout(() => navigate('/login'), 800);
      return;
    }

    // add user message locally
    setMessages((m) => [...m, { from: 'user', text: trimmed }]);
    setInput("");
    setSending(true);

    try {
      const payload = { message: trimmed, userId: currentUser?._id };
      const res = await sendChat(payload.message);
      // Try several likely response shapes
      const reply = res?.reply || res?.message || res?.data || JSON.stringify(res);
      setMessages((m) => [...m, { from: 'bot', text: reply }]);
      speakFunc(reply);
    } catch (err) {
      console.error('Chat send error', err);
      if (err && err.response && err.response.status === 401) {
        setMessages((m) => [...m, { from: 'bot', text: 'Session expired. Please login again.' }]);
        setTimeout(() => navigate('/login'), 800);
      } else {
        setMessages((m) => [...m, { from: 'bot', text: 'Sorry, something went wrong.' }]);
      }
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    // scroll to bottom when messages change
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e && e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="chat-container d-flex flex-column justify-content-center align-items-center">
      <button className="chat-close-btn btn btn-danger" onClick={handleClose}>
        ✕
      </button>

      <div className="robot-wrapper text-center animate__animated animate__fadeIn">
        <img src={robotGif} alt="Robot" className="robot-gif img-fluid" />

        <button
          className={`mic-btn btn btn-light ${isListening ? "listening" : ""}`}
          onClick={handleMicClick}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          <i className={`fa-solid ${isListening ? "fa-microphone-lines" : "fa-microphone-lines-slash"}`}></i>
        </button>

        <img src={sparkleGif} alt="Sparkle" className="sparkle-gif img-fluid animate__animated animate__pulse animate__infinite" />
      </div>

      <div className="chat-panel w-100 mt-4">
        <div className="messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`message ${m.from}`}>
              <div className="message-text">{m.text}</div>
            </div>
          ))}
        </div>

        <form className="chat-input d-flex" onSubmit={handleSubmit}>
          <input
            aria-label="Type a message"
            className="form-control me-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentUser ? `Message as ${currentUser.fullName || currentUser.email}` : 'Type a message...'}
            disabled={sending}
          />
          <button className="btn btn-primary" type="submit" disabled={sending}>
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
