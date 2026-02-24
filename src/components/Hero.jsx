import React from "react";
import { Button, Container, Row, Col } from "react-bootstrap";

import { useNavigate } from "react-router-dom";
import "../styles/Hero.css";
import aboutIllustration from "../assets/about.jpeg"; // adjust path
import heroImage from "../assets/hero-ai.jpeg";

export default function Hero() {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="hero-section">
        <div className="hero-container">

          <div className="hero-content">
            <p className="hero-tagline">
              AI-Powered Emotional Clarity
            </p>

            <h1 className="hero-title">
              Understand Your Mind. <br />
              <span>Improve Your Well-Being.</span>
            </h1>

            <p className="hero-subtitle">
              NeuroWell uses intelligent emotion analysis and behavioral insights
              to help you recognize patterns, reduce stress, and build lasting
              resilience — privately and securely.
            </p>

            <div className="hero-buttons">

              <Button
                className="cta-secondary"
                onClick={() => scrollTo("about")}
              >
                Explore
              </Button>



            </div>

            <div className="hero-features">
              <div className="feature-item">
                <span>🧠</span>
                <p>Behavioral Insights</p>
              </div>

              <div className="feature-item">
                <span>🛡</span>
                <p>Complete Data Privacy</p>
              </div>

              <div className="feature-item">
                <span>🤖</span>
                <p>Smart AI Companion</p>
              </div>
            </div>
          </div>

          <div className="hero-image-container">
            <img
             src={heroImage}
             alt="NeuroWell AI Illustration"
             className="hero-image"
            />
          </div>

        </div>
      </section>


      {/* ================= ABOUT SECTION ================= */}
      <section id="about" className="about-section">
        <Container>
          <Row className="align-items-center">

            <Col lg={6} className="mb-4 mb-lg-0">
              <img
                src={aboutIllustration}
                alt="Mental Wellness Illustration"
                className="img-fluid rounded shadow-sm"
              />
            </Col>

            <Col lg={6}>
              <h2 className="section-title">About NeuroWell</h2>
              <p className="section-text">
                NeuroWell is an AI-powered mental wellness platform designed for students and professionals.
                It combines mindfulness, interactive tools, mood tracking, and AI guidance to support emotional balance and mental clarity.
              </p>
              <p className="section-text">
                With personalized insights and guided exercises, NeuroWell helps you reduce stress, improve focus, and maintain a healthy mental state every day.
              </p>

              <Button
                className="cta-primary mt-3"
                onClick={() => scrollTo("features")}
              >
                Explore Features
              </Button>
            </Col>

          </Row>
        </Container>
      </section>
    </>
  );
}