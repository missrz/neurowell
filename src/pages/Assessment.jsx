import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Assessment.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { fetchTodayAssessment, completeAssessment } from "../services/api";

export default function Assessment() {
  const navigate = useNavigate();
  
  // questions will be loaded from server; fallback option types below
  
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
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [result, setResult] = useState(null);
  
  const progress = (() => {
    const total = (assessment && assessment.questions && assessment.questions.length) || 0;
    if (total === 0) return 0;
    // if assessment already completed (server indicates), show full progress
    if ((assessment && assessment.alreadyCompleted) || (result && result.alreadyCompleted)) return 100;
    return ((current + 1) / total) * 100;
  })();
  // turnary operator current == 0 ? 0 :(the if else formate)
  const handleAnswer = (value) => {
    const updated = [...answers];
    updated[current] = value;
    setAnswers(updated);
    
    const total = (assessment && assessment.questions && assessment.questions.length) || 0;
    if (current < total - 1) {
      setCurrent(current + 1);
      return;
    }
    
    // last question -> submit
    submitAnswers(updated);
  };
  
  const getResultMessage = (percent) => {
    if (percent >= 90) return "🌟 Excellent! You’re feeling emotionally strong, calm, and well-balanced. Keep nurturing these positive habits and continue prioritizing your mental well-being.";
    if (percent >= 80) return "😊 Very good! Your mental health seems stable and positive overall. Occasional stress is normal—continue practicing healthy routines and self-care.";
    if (percent >= 70) return "🙂 Good. You appear to be managing well, though there may be mild stress or low-energy moments. Paying attention to rest and emotional balance can help further.";
    if (percent >= 60) return "😐 Fair. You might be experiencing noticeable stress or reduced motivation. Small changes like better sleep, relaxation, and short breaks can make a difference.";
    if (percent >= 50) return "😕 Below average. Emotional strain or stress may be affecting you. Try focusing on self-care, talking with someone you trust, and reducing pressure where possible.";
    if (percent >= 40) return "😟 Low. You may be feeling overwhelmed, unmotivated, or emotionally drained. Taking time to rest and seeking emotional support is strongly encouraged.";
    if (percent >= 30) return "😞 Very low. Your responses suggest significant emotional distress. You are not alone—consider reaching out to a close person or a mental health professional.";
    return "🚨 Critical. You may be experiencing serious emotional difficulties. Please consider seeking professional help or talking to a trusted support person as soon as possible.";
  };
  
  const currentQuestion = (assessment && assessment.questions && assessment.questions[current]) || null;
  const options = (() => {
    if (!currentQuestion) return [];
    if (Array.isArray(currentQuestion.options) && currentQuestion.options.length) {
      return currentQuestion.options.map((o) => ({ label: o, value: o }));
    }
    // fallback to optionMap by type
    const fallback = optionMap[currentQuestion.type] || optionMap['level'];
    return fallback.map((o) => ({ label: o.label, value: o.label }));
  })();
  
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchTodayAssessment();
        if (!mounted) return;
        setAssessment(data);
        
        // if server indicates user already completed today's assessment, show result view
        if (data && data.alreadyCompleted) {
          setSubmitted(true);
          setResult({ score: data.history && typeof data.history.score !== 'undefined' ? data.history.score : 0, alreadyCompleted: true });
        }
      } catch (e) {
        console.error('Failed to load assessment', e && e.message ? e.message : e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);
  
  const submitAnswers = async (answersToSend) => {
    try {
      const res = await completeAssessment(assessment._id, answersToSend);
      setResult(res);
      setSubmitted(true);
    } catch (e) {
      console.error('Failed to submit assessment', e && e.message ? e.message : e);
      setSubmitted(true);
    }
  };
  
  return (
    <div className="assessment-container">
    <button
    className="close-btn btn btn-danger"
    onClick={() => navigate("/dashboard")}
    >
    ✕
    </button>
    
    <div className="assessment-card p-5 text-center">
    <h2
    className="mb-3"
    style={{
      background: "linear-gradient(90deg, #7b00ff, #00eaff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    }}
    >
    Mental Wellness Assessment
    </h2>
    {/* Progress */}
    <div className="progress mb-4">
    <div
    className="progress-bar bg-success"
    style={{ width: `${progress}%` }}
    />
    </div>
    
    {!submitted ? (
      <>
      {loading || !currentQuestion ? (
        <h5 className="mb-4 question-text">Loading assessment...</h5>
      ) : (
        <h5 className="mb-4 question-text">{currentQuestion.title || currentQuestion.text}</h5>
      )}
      {!loading && currentQuestion && (
        <>
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
        
        <p className="question-progress mt-4">Question {current + 1} of {(assessment.questions || []).length}</p>
        </>
      )}
      </>
    ) : (
      <div className="result animate__animated animate__fadeIn">
      <h3 className="text-light mb-3">Assessment Result</h3>
      {result && result.alreadyCompleted && (
        <p className="text-warning">You have already completed the assessment for today.</p>
      )}
      <h5 className="text-info">
      Score: {result && typeof result.score !== 'undefined' ? `${result.score}%` : '—'}
      </h5>
      <p className="mb-4 question-text">{getResultMessage(result && result.score ? result.score : 0)}</p>
      
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
