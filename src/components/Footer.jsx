// src/components/Footer.jsx
import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import "../styles/Footer.css";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="nw-footer light">
      <Container>
        <Row className="gy-4">
          {/* Brand & Description */}
          <Col md={4}>
            <h4 className="footer-brand">🧠 NeuroWell</h4>
            <p className="footer-desc">
              AI-Powered Early Mental Health Detection & Support Platform. Built for awareness, early signals, and guided support.
            </p>
            <div className="footer-socials">
              <FaFacebookF />
              <FaInstagram />
              <FaLinkedinIn />
            </div>
          </Col>

          {/* Platform Links */}
          <Col md={3}>
            <h6 className="footer-title">Platform</h6>
            <p onClick={() => navigate("/about")} className="footer-link">About NeuroWell</p>
            <p onClick={() => navigate("/assessment")} className="footer-link">Assessment</p>
            <p onClick={() => navigate("/chatbot")} className="footer-link">AI Chat Support</p>
            <p onClick={() => navigate("/helpline")} className="footer-link">Helpline</p>
          </Col>

          {/* Resources */}
          <Col md={3}>
            <h6 className="footer-title">Resources</h6>
            <p className="footer-link">How It Works</p>
            <p className="footer-link">Research Basis</p>
            <p className="footer-link">Privacy Policy</p>
            <p className="footer-link">Terms of Use</p>
          </Col>
        </Row>

          {/* Newsletter */}
          {/* <Col md={2}>
            <h6 className="footer-title">Stay Updated</h6>
            <Form>
              <Form.Control 
                placeholder="Your email" 
                size="sm" 
                className="mb-2 footer-input" 
              />
              <Button size="sm" className="w-100 btn-gradient">Subscribe</Button>
            </Form>
          </Col> */}
      

        <hr />

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} NeuroWell</span>
          <span className="footer-disclaimer">Educational support tool — Not a medical diagnosis system</span>
        </div>
      </Container>
    </footer>
  );
}