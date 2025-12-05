// src/pages/Journal.jsx
import React, { useState, useEffect } from "react";
import "../styles/Journal.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";

export default function Journal() {
  const [entry, setEntry] = useState("");

  // Auto-save to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("journalEntry");
    if (saved) setEntry(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem("journalEntry", entry);
  };

  return (
    <div className="journal-container">
      <motion.h2
        className="journal-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        📝 Personal Journal
      </motion.h2>

      <motion.p
        className="journal-sub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        Write your thoughts and feelings freely.
      </motion.p>

      <motion.textarea
        className="journal-textarea"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Start writing here..."
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <motion.button
        className="save-btn btn btn-info mt-3"
        onClick={handleSave}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
      >
        Save Entry
      </motion.button>
    </div>
  );
}
