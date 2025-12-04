import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Assessment.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Assessment() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    { id: "q1", text: "How are you feeling today?" },
    { id: "q2", text: "Do you often feel stressed?" },
    { id: "q3", text: "How motivated do you feel currently?" },
  ];

  const options = ["Not at all", "Sometimes", "Often", "Always"];

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!answers.q1 || !answers.q2 || !answers.q3) {
      alert("Please answer all questions!");
      return;
    }
    setSubmitted(true);
    console.log("User answers:", answers);
  };

  return (
    <div className="assessment-container">
      <button className="close-btn btn btn-danger" onClick={() => navigate("/")}>
        ✕
      </button>

      <div className="assessment-card p-5 text-center">
        <h1 className="mb-4 animate__animated animate__fadeInDown">Assessment</h1>

        {!submitted ? (
          <div className="questions">
            {questions.map((q) => (
              <div key={q.id} className="mb-4 animate__animated animate__fadeInUp">
                <h5 className="text-light">{q.text}</h5>
                <div className="d-flex justify-content-center gap-3 flex-wrap mt-2">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      className={`btn option-btn ${
                        answers[q.id] === opt ? "selected" : ""
                      }`}
                      onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button className="btn btn-primary mt-4 submit-btn animate__animated animate__pulse" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        ) : (
          <div className="result animate__animated animate__fadeIn">
            <h3 className="text-light">Thank you! Your assessment is recorded.</h3>
            <button className="btn btn-success mt-3" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
