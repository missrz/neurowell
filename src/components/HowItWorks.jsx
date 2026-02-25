import React from "react";
import "../styles/HowItWorks.css"
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  FaUserCircle,
  FaClipboard,
  FaSmileBeam,
  FaRobot,
  FaBrain,
  FaComments,
  FaChartLine,
  FaBookOpen   // ✅ Use this instead
} from "react-icons/fa";

export default function HowItWorks() {
  const steps = [
    {
      icon: <FaUserCircle />,
      title: "Create Account",
      desc: "Sign up securely to begin your mental wellness journey."
    },
    {
      icon: <FaClipboard />,
      title: "Take Assessment",
      desc: "Answer guided questions to evaluate your mental state."
    },
    {
      icon: <FaSmileBeam />,
      title: "Track Mood",
      desc: "Log daily emotions and behavior patterns."
    },
    {
      icon: <FaRobot />,
      title: "Get AI Insights",
      desc: "Receive personalized AI-powered suggestions."
    },
    {
      icon: <FaBrain />,
      title: "Play Brain Games",
      desc: "Boost cognitive strength with smart exercises."
    },
    {
      icon: <FaComments />,
      title: "Chat with NeuroBot",
      desc: "Get personalized mental wellness support."
    },
   {
  icon: <FaBookOpen />,
  title: "Journal Your Thoughts",
  desc: "Capture and reflect on your daily thoughts and feelings."
   },
    {
      icon: <FaChartLine />,
      title: "Track Progress",
      desc: "Visual dashboards show your improvement."
    }
  ];

  return (
    <section className="howworks-section">
      <Container>

        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">
          A simple guided flow to monitor and improve your mental wellness.
        </p>

        <Row className="g-4 mt-4">
  {steps.map((step, i) => (
<Col md={3} key={i}>              <Card className="how-card text-center p-4 h-100">

                <div className="step-badge">
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div className="how-icon">
                  {step.icon}
                </div>

                <h3 className="how-title">{step.title}</h3>
                <p className="how-desc">{step.desc}</p>

              </Card>
            </Col>
          ))}
        </Row>

      </Container>
    </section>
  );
}