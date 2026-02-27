import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import Footer from "../components/Footer";

export default function Dashboard() {
  const navigate = useNavigate();
  
  /* -------------------------- FEATURES LIST -------------------------- */
  const features = [
    {
      title: "Assessment",
      icon: "📊",
      desc: "Take personalized scientific assessment.",
      route: "/assessment",
    },
    {
      title: "Chat / Support",
      icon: "💬",
      desc: "Talk to AI Assistant or Support.",
      route: "/chats",
    },
    {
      title: "Mood Tracker",
      icon: "😊",
      desc: "Track your mood trends visually.",
      route: "/mood-tracker",
    },
    {
      title: "Stress Relief Games",
      icon: "🎮",
      desc: "Relax with interactive brain games.",
      route: "/stress-games",
    },
    {
      title: "Journal",
      icon: "📓",
      desc: "Write down your daily thoughts.",
      route: "/journal",
    },
    {
      title: "Progress Analytics",
      icon: "📈",
      desc: "Visual representation of your growth.",
      route: "/AdvancedAnalytics",
    },
    // {
    //   title: "Resources & Helplines",
    //   icon: "📚",
    //   desc: "Professional mental health resources.",
    //   route: "/resources",
    // },
  ];

  const handleClick = (route) => {
    navigate(route);
  };
  
  return (
    <div
    className="dashboard-container"
    style={{
      background: "linear-gradient(135deg, #fdf6ff, #fcefee, #eaf4ff)",
      minHeight: "100vh",
      overflowX: "hidden",
      paddingTop: "75px"
    }}
    
    >
    <div className="container py-4">
    
    {/* HEADER */}
    <h1 className="text-center mb-5 animate__animated animate__fadeInDown dashboard-title">
    Features
    </h1>
    
    {/* FEATURES GRID */}
    <div className="row g-4">
    {features.map((feat, index) => (
      <div
      key={index}
      className="col-12 col-md-6 col-lg-4"
      onClick={() => handleClick(feat.route)}
      style={{ cursor: "pointer" }}
      >
      <div
      className="card feature-card futuristic-card text-center p-4"
      style={{ animationDelay: `${index * 0.1}s` }}
      >
      <div className="feature-icon futuristic-icon mb-3">
      {feat.icon}
      </div>
      <h5 className="fw-bold">{feat.title}</h5>
      <p className="card-desc">{feat.desc}</p>
      </div>
      </div>
    ))}
    </div>
    
    </div>
    
    </div>
  );
}