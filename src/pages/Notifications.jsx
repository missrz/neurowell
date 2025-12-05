// src/pages/Notifications.jsx
import React, { useState } from "react";
import "../styles/Notifications.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Welcome!", text: "Thanks for joining the platform.", read: false },
    { id: 2, title: "Daily Reminder", text: "Don’t forget to check your mood today.", read: false },
    { id: 3, title: "Motivation", text: "You’re doing amazing. Keep going! 💙", read: true },
  ]);

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="notifications-container">
      <h2 className="notif-title">🔔 Notifications</h2>

      {notifications.length === 0 ? (
        <p className="empty-text">No notifications right now.</p>
      ) : (
        notifications.map((notif) => (
          <motion.div
            key={notif.id}
            className={`notif-card ${notif.read ? "read" : "unread"}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="notif-content">
              <h5>{notif.title}</h5>
              <p>{notif.text}</p>
            </div>

            <div className="notif-actions">
              {!notif.read && (
                <button className="btn btn-sm btn-info" onClick={() => markRead(notif.id)}>
                  Mark Read
                </button>
              )}
              <button className="btn btn-sm btn-danger" onClick={() => deleteNotification(notif.id)}>
                Delete
              </button>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
