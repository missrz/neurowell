import React, { useState, useEffect } from "react";
import Chatbot from "../components/Chatbot";
import "../styles/FullChatbotPage.css";

export default function FullChatbotPage() {
  const [robotState, setRobotState] = useState("idle"); // idle, listening, thinking

  const speakFunc = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    speakFunc("Hello! I am your NeuroWell voice assistant.");
    greetingFunc();
  }, []);

  const greetingFunc = () => {
    const hour = new Date().getHours();
    if (hour < 12) speakFunc("Good Morning, how can I help you?");
    else if (hour < 16) speakFunc("Good Afternoon, how can I help you?");
    else speakFunc("Good Evening, how can I help you?");
  };

  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support voice input!");
      return;
    }

    const rec = new window.webkitSpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = false;

    rec.onstart = () => setRobotState("listening");
    rec.onend = () => setRobotState("idle");
    rec.onresult = (e) => {
      const spokenText = e.results[0][0].transcript.toLowerCase();
      handleCommands(spokenText);
      setRobotState("thinking");
      setTimeout(() => setRobotState("idle"), 2000);
    };

    rec.start();
  };

  const handleCommands = (command) => {
    if (command.includes("hello") || command.includes("hi")) speakFunc("Hello! How can I help you?");
    else if (command.includes("who are you")) speakFunc("I am Nova, your NeuroWell AI assistant.");
    else speakFunc(`I searched for "${command}" on the internet.`);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(command)}`);
  };

  return (
    <div className="full-chatbot-page">
      <h1>NeuroWell AI Chatbot</h1>

      <div className="robot-animation">
        {robotState === "idle" && <img src="/assets/ai-idle.gif" alt="Idle Robot" />}
        {robotState === "listening" && <img src="/assets/ai-listening.gif" alt="Listening Robot" />}
        {robotState === "thinking" && <img src="/assets/ai-1.gif" alt="Thinking Robot" />}
      </div>

      <button className="voice-btn" onClick={startVoiceInput}>🎤 Talk to Nova</button>

      <Chatbot fullPage={true} setRobotState={setRobotState} />
    </div>
  );
}
