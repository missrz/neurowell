// src/pages/Notifications.jsx
import React, { useState, useEffect } from "react";
import "../styles/Notifications.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import { fetchUserTips, deleteTip, markTipRead } from "../services/api";
import ToastNotification from "../components/ToastNotification";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const currentUser = useSelector((state) => state.user.user);

  useEffect(() => {
    const load = async (uid) => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserTips(uid);
        const items = Array.isArray(data) ? data : data.tips || data.items || [];

        const normalized = items.map((it, idx) => ({
          id: it.id || it._id || idx,
          title: it.title || it.heading || it.subject || "Tip",
          text: it.text || it.body || it.message || it.description || "",
          read: !!(it.isReaded || it.read),
        }));

        setNotifications(normalized);
      } catch (err) {
        setError(err.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    if (!currentUser) return;
    const uid = currentUser._id || currentUser?.id;
    if (!uid) return;
    load(uid);
  }, [currentUser]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const markRead = async (id) => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif || notif.read) return;

    // optimistic UI
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isReaded: true } : n)));

    try {
      const uid = currentUser?._id || currentUser?.id;
      if (!uid) throw new Error("No user id available");
      await markTipRead(uid, id);
      setToastType('success');
      setToastMessage('Marked notification read');
    } catch (err) {
      // rollback
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isReaded: false } : n)));
      setError(err.message || "Failed to mark notification read");
      setToastType('error');
      setToastMessage(err.message || 'Failed to mark notification read');
    }
  };

  const deleteNotification = async (id) => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif) return;
    try {
      await deleteTip(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setToastType('success');
      setToastMessage('Notification deleted');
    } catch (err) {
      setError(err.message || "Failed to delete notification");
      setToastType('error');
      setToastMessage(err.message || 'Failed to delete notification');
    }
  };

  return (
    <div className="notifications-container">
      
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
        onClick={() => window.location.href = "/dashboard"}
      >
        ✕
      </button>
      <h2 className="notif-title">🔔 Notifications</h2>

      {loading ? (
        <p className="empty-text">Loading...</p>
      ) : error ? (
        <p className="empty-text text-danger">{error}</p>
      ) : notifications.length === 0 ? (
        <p className="empty-text">No notifications right now.</p>
      ) : (
        notifications.map((notif) => (
          <motion.div
            key={notif.id}
            className={`notif-card ${notif.read ? "read" : "unread"}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => !notif.read && markRead(notif.id)}
            style={{ cursor: notif.read ? "default" : "pointer" }}
          >
            <div className="notif-content">
              
              <h5>{notif.title}</h5>
              <p>{notif.text}</p>
            </div>

            <div className="notif-actions">
              {!notif.read && (
                <button className="btn btn-sm btn-info" onClick={(e) => { e.stopPropagation(); markRead(notif.id); }}>
                  Mark Read
                </button>
              )}
              <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}>
                Delete
              </button>
            </div>
          </motion.div>
        ))
      )}
      {toastMessage && (
        <ToastNotification message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
