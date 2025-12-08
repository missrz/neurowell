// src/pages/SOS.jsx
import React, { useState } from "react";
import "../styles/SOS.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function SOS() {
  const navigate = useNavigate();
  const [alertActive, setAlertActive] = useState(false);

  const emergencyContacts = [
    { id: 1, name: "Police", number: "100" },
    { id: 2, name: "Ambulance", number: "102" },
    { id: 3, name: "Fire Brigade", number: "101" },
  ];

  const triggerSOS = () => {
    setAlertActive(true);

    // vibration for mobile
    if (navigator.vibrate) {
      navigator.vibrate([500, 300, 500, 300]);
    }

    // deactivate alert after 3 seconds
    setTimeout(() => setAlertActive(false), 3000);
  };

  return (
    <div className="sos-container">

      {/* Close Button */}
      <button
        className="mood-close-btn btn btn-danger"
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          fontSize: "22px",
          borderRadius: "50%",
          width: "45px",
          height: "45px",
          zIndex: "999",
        }}
        onClick={() => navigate("/dashboard")}
      >
        ✕
      </button>

      {/* Heading */}
      <motion.h2
        className="sos-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🚨 Emergency SOS
      </motion.h2>

      {/* SOS Button */}
      <motion.button
        className={`sos-button ${alertActive ? "sos-activated" : ""}`}
        onClick={triggerSOS}
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: alertActive ? [1, 1.15, 1] : 1,
          boxShadow: alertActive
            ? [
                "0 0 20px red",
                "0 0 40px red",
                "0 0 20px red"
              ]
            : "none",
        }}
        transition={{
          duration: 0.5,
          repeat: alertActive ? Infinity : 0,
        }}
      >
        SOS
      </motion.button>

      {/* Contacts */}
      <h4 className="contact-title">Emergency Contacts</h4>

      <div className="contact-list">
        {emergencyContacts.map((c) => (
          <motion.div
            key={c.id}
            className="contact-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <h5>{c.name}</h5>
              <p>{c.number}</p>
            </div>

            <div>
              <a href={`tel:${c.number}`} className="btn btn-success btn-sm">
                Call Now
              </a>
              <a
                href={`sms:${c.number}?body=I need help immediately!`}
                className="btn btn-danger btn-sm ms-2"
              >
                Message
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
