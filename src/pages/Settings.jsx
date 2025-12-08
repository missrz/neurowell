import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Settings.css";

export default function Settings() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "User",
    email: "User@example.com",
    notifications: true,
    darkMode: true,
    password: "",
    themeColor: "#00ffff",
    avatar: "https://via.placeholder.com/80",
  });

  const [activeTab, setActiveTab] = useState("account");
  const [closing, setClosing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("userSettings"));
    if (savedSettings) setFormData(savedSettings);
  }, []);

  // Apply dark mode dynamically
  useEffect(() => {
    if (formData.darkMode) {
      document.body.style.backgroundColor = "#0d0d0d";
      document.body.style.color = "#fff";
    } else {
      document.body.style.backgroundColor = "#fff";
      document.body.style.color = "#000";
    }
  }, [formData.darkMode]);

  // Apply theme color dynamically
  useEffect(() => {
    document.querySelectorAll("h1, .btn-info").forEach((el) => {
      el.style.color = formData.themeColor;
      if (el.classList.contains("btn-info")) {
        el.style.background = `linear-gradient(90deg, ${formData.themeColor}, #8e44ad)`;
      }
    });
  }, [formData.themeColor]);

  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;

    if (name === "avatar" && files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("userSettings", JSON.stringify(formData));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => navigate("/dashboard"), 300);
  };

  return (
    <section className="settings-page d-flex justify-content-center align-items-start">
      <div className={`settings-container position-relative ${closing ? "closing" : ""}`}>
        {/* Close Button */}
        <button type="button" className="btn-close" aria-label="Close" onClick={handleClose}>
          ✕
        </button>

        <h1>Settings</h1>
        <p className="lead">Customize your account and preferences.</p>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-3 justify-content-center">
          {["account", "preferences", "appearance", "security"].map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          ))}
        </ul>

        {/* Tab Content */}
        <div className="settings-card animate__animated animate__fadeIn">
          <form onSubmit={handleSave}>
            {activeTab === "account" && (
              <>
                <div className="d-flex justify-content-center mb-3">
                  <div className="profile-section text-center">
                    <img src={formData.avatar} alt="Avatar" />
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      id="avatarUpload"
                      name="avatar"
                      onChange={handleChange}
                    />
                    <label
                      htmlFor="avatarUpload"
                      className="btn btn-sm btn-info mt-2"
                      style={{ cursor: "pointer" }}
                    >
                      Change
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </>
            )}

            {activeTab === "preferences" && (
              <>
                <div className="form-check form-switch mb-3 d-flex justify-content-between align-items-center">
                  <label className="form-check-label">Enable Notifications</label>
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={formData.notifications}
                    onChange={handleChange}
                    className="form-check-input"
                  />
                </div>

                <div className="form-check form-switch mb-3 d-flex justify-content-between align-items-center">
                  <label className="form-check-label">Dark Mode</label>
                  <input
                    type="checkbox"
                    name="darkMode"
                    checked={formData.darkMode}
                    onChange={handleChange}
                    className="form-check-input"
                  />
                </div>
              </>
            )}

            {activeTab === "appearance" && (
              <div className="d-flex flex-column gap-3">
                <label className="form-label text-light">Choose Theme Color</label>
                <input
                  type="color"
                  name="themeColor"
                  value={formData.themeColor}
                  onChange={handleChange}
                />
                <p className="text-light mt-2">Preview your selected theme above!</p>
              </div>
            )}

            {activeTab === "security" && (
              <div className="mb-3">
                <label className="form-label">Change Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="New password"
                  className="form-control"
                />
              </div>
            )}

            <button type="submit" className="btn btn-info w-100 mt-3">
              Save Settings
            </button>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {saved && <div className="toast">Settings Saved!</div>}
    </section>
  );
}
