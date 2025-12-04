// src/components/Contact.jsx
import React, { useState } from "react";
import "../styles/Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Your message has been sent!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleCancel = () => {
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section className="contact-page">
      <div className="contact-container">
        {/* Sidebar with contact info */}
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <p>Reach out for questions or collaborations!</p>
          <div className="info-item">
            <span>📧</span>
            <p>contact@neurowell.com</p>
          </div>
          <div className="info-item">
            <span>📞</span>
            <p>+91 98765 43210</p>
          </div>
          <div className="info-item">
            <span>📍</span>
            <p>Mumbai, India</p>
          </div>
        </div>

        {/* Contact form */}
        <div className="contact-card">
          <h2>Contact Us</h2>
          <p className="lead">We’d love to hear from you. Fill the form below.</p>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="field">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder=" "
              />
              <label>Your Name</label>
            </div>

            <div className="field">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder=" "
              />
              <label>Email Address</label>
            </div>

            <div className="field full">
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder=" "
              />
              <label>Subject</label>
            </div>

            <div className="field full">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder=" "
              ></textarea>
              <label>Your Message</label>
            </div>

            <div className="actions">
              <button type="button" className="btn ghost" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
