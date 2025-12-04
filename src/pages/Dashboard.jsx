import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Dashboard() {
  const navigate = useNavigate();

  // Example stats - can fetch from backend or localStorage
  const stats = [
    { title: "Mood Tracker", value: "23 entries", icon: "😊" },
    { title: "Assessments Taken", value: "5", icon: "📊" },
    { title: "Chats with AI", value: "12 sessions", icon: "🤖" },
    { title: "Support Contacts", value: "3", icon: "💬" },
  ];

  return (
    <div className="dashboard-container">

      {/* ← Go Back Button */}
      <button
        className="close-btn btn btn-danger"
        onClick={() => navigate("/home")}   // <<< CHANGE PATH HERE
      >
        ✕
      </button>

      <div className="container py-5">
        <h1 className="text-center mb-5 animate__animated animate__fadeInDown text-light">
          Dashboard
        </h1>

        <div className="row g-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="col-12 col-md-6 col-lg-3 animate__animated animate__fadeInUp"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="card stat-card text-center p-4">
                <div className="icon mb-3">{stat.icon}</div>
                <h5 className="card-title">{stat.title}</h5>
                <p className="card-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
