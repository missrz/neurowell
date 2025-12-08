// src/pages/Resources.jsx
import React from "react";
import "../styles/Resources.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Resources() {
  const navigate = useNavigate(); // ✅ FIXED: must initialize navigate()

  const resourceList = [
    {
      id: 1,
      title: "Understanding Stress",
      desc: "Learn how stress affects your body & mind.",
      link: "https://www.healthline.com/health/stress",
      tag: "Article",
    },
    {
      id: 2,
      title: "Anxiety Management Guide",
      desc: "Effective techniques to reduce anxiety levels.",
      link: "https://www.verywellmind.com/",
      tag: "Guide",
    },
    {
      id: 3,
      title: "Meditation for Beginners",
      desc: "A simple 10-minute meditation session.",
      link: "https://youtu.be/inpok4MKVLM",
      tag: "Video",
    },
    {
      id: 4,
      title: "Improve Sleep Quality",
      desc: "Steps to build a healthy sleep schedule.",
      link: "https://www.sleepfoundation.org/",
      tag: "Health",
    },
    {
      id: 5,
      title: "Depression Support",
      desc: "Trusted information & support contacts.",
      link: "https://www.who.int/news-room/fact-sheets/detail/depression",
      tag: "Support",
    },
  ];

  return (
    <div className="resources-container">

      {/* Close Button */}
      <button
        className="mood-close-btn btn btn-danger"
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          fontSize: "22px",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          zIndex: "999",
        }}
        onClick={() => navigate("/dashboard")} // ✅ Works now
      >
        ✕
      </button>

      {/* Title */}
      <motion.h2
        className="resources-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📚 Helpful Mental Health Resources
      </motion.h2>

      <p className="resource-sub">
        Explore trusted guides, videos, and articles to support your well-being.
      </p>

      {/* Grid */}
      <div className="resource-grid">
        {resourceList.map((item) => (
          <motion.div
            key={item.id}
            className="resource-card"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="resource-tag">{item.tag}</span>

            <h4>{item.title}</h4>
            <p>{item.desc}</p>

            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="btn btn-info mt-2"
            >
              Open Resource
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
