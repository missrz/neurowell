import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Assessment.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Assessment() {
  const navigate = useNavigate();

  // =========================
  // Questions with option types
  // =========================
  const questions = [
    {
      text: "How are you feeling emotionally today?",
      type: "mood",
    },
    {
      text: "How often do you feel stressed or overwhelmed?",
      type: "frequency",
    },
    {
      text: "How motivated do you feel to complete daily tasks?",
      type: "level",
    },
    {
      text: "How well have you been sleeping recently?",
      type: "quality",
    },
    {
      text: "How often do you feel calm and relaxed?",
      type: "frequency",
    },
    {
      text: "How confident do you feel about handling problems?",
      type: "level",
    },
    {
      text: "How frequently do negative thoughts affect you?",
      type: "frequency",
    },
  ];

  // =========================
  // Options based on type
  // Levels always start from LOW → HIGH
  // =========================
  const optionMap = {
    mood: [
      { label: "Very Bad", value: 1 },
      { label: "Bad", value: 2 },
      { label: "Okay", value: 3 },
      { label: "Good", value: 4 },
      { label: "Very Good", value: 5 },
    ],
    frequency: [
      { label: "Never", value: 1 },
      { label: "Rarely", value: 2 },
      { label: "Sometimes", value: 3 },
      { label: "Often", value: 4 },
      { label: "Always", value: 5 },
    ],
    level: [
      { label: "Very Low", value: 1 },
      { label: "Low", value: 2 },
      { label: "Moderate", value: 3 },
      { label: "High", value: 4 },
      { label: "Very High", value: 5 },
    ],
    quality: [
      { label: "Very Poor", value: 1 },
      { label: "Poor", value: 2 },
      { label: "Average", value: 3 },
      { label: "Good", value: 4 },
      { label: "Excellent", value: 5 },
    ],
  };

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const progress = current == 0 ? 0 : ((current + 1) / questions.length) * 100;
  // turnary operator current == 0 ? 0 :(the if else formate)
  const handleAnswer = (value) => {
    const updated = [...answers];
    updated[current] = value;
    setAnswers(updated);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setSubmitted(true);
    }
  };

  const totalScore = answers.reduce((a, b) => a + b, 0);
  const maxScore = questions.length * 5;

  const getResultMessage = () => {
    const percent = (totalScore / maxScore) * 100;

    if (percent >= 90)
    return "🌟 Excellent! You’re feeling emotionally strong, calm, and well-balanced. Keep nurturing these positive habits and continue prioritizing your mental well-being.";

  if (percent >= 80)
    return "😊 Very good! Your mental health seems stable and positive overall. Occasional stress is normal—continue practicing healthy routines and self-care.";

  if (percent >= 70)
    return "🙂 Good. You appear to be managing well, though there may be mild stress or low-energy moments. Paying attention to rest and emotional balance can help further.";

  if (percent >= 60)
    return "😐 Fair. You might be experiencing noticeable stress or reduced motivation. Small changes like better sleep, relaxation, and short breaks can make a difference.";

  if (percent >= 50)
    return "😕 Below average. Emotional strain or stress may be affecting you. Try focusing on self-care, talking with someone you trust, and reducing pressure where possible.";

  if (percent >= 40)
    return "😟 Low. You may be feeling overwhelmed, unmotivated, or emotionally drained. Taking time to rest and seeking emotional support is strongly encouraged.";

  if (percent >= 30)
    return "😞 Very low. Your responses suggest significant emotional distress. You are not alone—consider reaching out to a close person or a mental health professional.";

  return "🚨 Critical. You may be experiencing serious emotional difficulties. Please consider seeking professional help or talking to a trusted support person as soon as possible.";
  };

  const currentQuestion = questions[current];
  const options = optionMap[currentQuestion.type];

  return (
    <div className="assessment-container">
      <button
        className="close-btn btn btn-danger"
        onClick={() => navigate("/dashboard")}
      >
        ✕
      </button>

      <div className="assessment-card p-5 text-center">
        <h2 className="text-light mb-3">Mental Wellness Assessment</h2>

        {/* Progress */}
        <div className="progress mb-4">
          <div
            className="progress-bar bg-success"
            style={{ width: `${progress}%` }}
          />
        </div>

        {!submitted ? (
          <>
            <h5 className="text-light mb-4">
              {currentQuestion.text}
            </h5>

            <div className="d-flex justify-content-center flex-wrap gap-3">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  className="btn option-btn"
                  onClick={() => handleAnswer(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <p className="text-muted mt-4">
              Question {current + 1} of {questions.length}
            </p>
          </>
        ) : (
          <div className="result animate__animated animate__fadeIn">
            <h3 className="text-light mb-3">Assessment Result</h3>
            <h5 className="text-info">
              Score: {totalScore} / {maxScore}
            </h5>
            <p className="text-light mt-3">{getResultMessage()}</p>

            <button
              className="btn btn-success mt-3"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
