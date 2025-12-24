import React, { useEffect } from "react";

export default function ToastNotification({ message, type = "success", onClose }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose(); // 5 sec ke baad message null kar de
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const bgColor =
    type === "success" ? "#4caf50" :
    type === "error" ? "#f44336" :
    "#2196f3";

  const style = {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: bgColor,
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
    zIndex: 1000,
  };

  return <div style={style}>{message}</div>;
}
