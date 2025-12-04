import React, { useState } from "react";  
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Chat.css";

import robotGif from "../assets/a--2.gif";
import sparkleGif from "../assets/ai-1.gif";

export default function Chat() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  let recognition;
  let micTimeout;

  const handleClose = () => navigate("/");

  const speakFunc = (input) => {
    const utter = new SpeechSynthesisUtterance(input);
    utter.lang = "en-GB";
    window.speechSynthesis.speak(utter);
  };

  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Browser does not support voice input");
      return;
    }
    recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onresult = (e) => {
      const command = e.results[0][0].transcript.toLowerCase();
      handleCommands(command);
      stopVoiceInput();
    };
    recognition.onend = () => stopVoiceInput();

    recognition.start();
    setIsListening(true);

    micTimeout = setTimeout(() => recognition.stop(), 15000);
  };

  const stopVoiceInput = () => {
    if (recognition) recognition.stop();
    clearTimeout(micTimeout);
    setIsListening(false);
  };

  const handleMicClick = () => {
    if (!isListening) startVoiceInput();
    else stopVoiceInput();
  };

  const handleCommands = (command) => {
    console.log(command);
    if (command.includes("hello")) speakFunc("Hello! How can I help you?");
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
        >
          <i className={`fa-solid ${isListening ? "fa-microphone-lines" : "fa-microphone-lines-slash"}`}></i>
        </button>

        <img src={sparkleGif} alt="Sparkle" className="sparkle-gif img-fluid animate__animated animate__pulse animate__infinite" />
      </div>
    </div>
  );
}
