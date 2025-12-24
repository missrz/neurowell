import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../styles/Journal.css";
import ToastNotification from "../components/ToastNotification";
import {
  getUserJournals,
  saveJournal,
  updateJournal,
  deleteJournal,
} from "../services/api";

export default function JournalPage() {
  const currentUser = useSelector((state) => state.user.user);
  const userId = currentUser?._id;
  const today = new Date().toISOString().split("T")[0];
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [journals, setJournals] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null);

  // -----------------------------
  // CREATE EMPTY JOURNAL
  // -----------------------------
  const createEmptyJournal = (date) => ({
    _id: null,
    userId,
    title: "",
    text: "",
    date,
    pinned: false,
  });

  // -----------------------------
  // LOAD ALL JOURNALS
  // -----------------------------
  useEffect(() => {
  if (!currentUser) return;
  loadJournals(currentUser._id || currentUser?.id);
}, [currentUser]);


  const loadJournals = async (uid) => {
    const data = await getUserJournals(uid);
    if (!data) return;

    setJournals(data);

    const todayJournal = data.find((j) => j.date === today);
    setSelectedJournal(
      todayJournal ? todayJournal : createEmptyJournal(today)
    );
  };

  // -----------------------------
  // SAVE / UPDATE
  // -----------------------------
  const saveEntry = async (updatedJ) => {
    const newJ = updatedJ || selectedJournal;
    if (!newJ.text.trim()) return;
    const payload = {
      ...newJ,
      title:
        newJ.title.trim() ||
        newJ.text.split(" ").slice(0, 6).join(" "),
      userId,
    };

    let saved;
    if (newJ._id) {
      saved = await updateJournal(payload);
    } else {
      saved = await saveJournal(payload);
    }

    if (!saved) return;
    setToastType("success");
    setToastMsg("Data saved successfully!");
    setSelectedJournal(saved);

    setJournals((prev) => {
      const exists = prev.find((j) => j._id === saved._id);
      return exists
        ? prev.map((j) => (j._id === saved._id ? saved : j))
        : [saved, ...prev];
    });
  };

  // -----------------------------
  // DELETE
  // -----------------------------
  const handleDelete = async () => {
    if (!selectedJournal?._id) return;

    await deleteJournal(selectedJournal._id);
    setToastType("error");
    setToastMsg("Data deleted successfully!");
    setJournals((prev) =>
      prev.filter((j) => j._id !== selectedJournal._id)
    );

    setSelectedJournal(createEmptyJournal(today));
  };

  // -----------------------------
  // NEW JOURNAL
  // -----------------------------
  const createNewJournal = () => {
    setSelectedJournal(createEmptyJournal(today));
  };

  if (!currentUser) {
    return <div className="loading">Loading journals...</div>;
  }

  return (
    <>
    <ToastNotification
        message={toastMsg}
        type={toastType}
        onClose={() => setToastMsg(null)}
      />
    <div className="journal-container">
      {/* SIDEBAR */}
      <div className="journal-sidebar">
        <h3 className="journal-header">
          📓 Journal
          <button className="new-link" onClick={createNewJournal}>
            New
          </button>
        </h3>

        {journals
          .sort((a, b) => b.pinned - a.pinned)
          .map((j) => (
            <button
              key={j._id}
              className={selectedJournal?._id === j._id ? "active" : ""}
              onClick={() => setSelectedJournal(j)}
            >
              <strong>{j.title}</strong>
              <br />
              <small>{j.date}</small>
              {j.pinned && " 📌"}
            </button>
          ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="journal-page">
        {!selectedJournal && (
          <div className="empty-state">
            Select a journal or click <b>New</b> ✨
          </div>
        )}

        {selectedJournal && (
          <>
            <input
              type="date"
              value={selectedJournal.date}
              onChange={(e) =>
                setSelectedJournal({
                  ...selectedJournal,
                  date: e.target.value,
                })
              }
            />

            <input
              placeholder="Journal title"
              value={selectedJournal.title}
              onChange={(e) =>
                setSelectedJournal({
                  ...selectedJournal,
                  title: e.target.value,
                })
              }
            />

            <textarea
              placeholder="Write freely..."
              value={selectedJournal.text}
              onChange={(e) =>
                setSelectedJournal({
                  ...selectedJournal,
                  text: e.target.value,
                })
              }
            />

            <div className="journal-actions">
              <button onClick={saveEntry}>💾 Save</button>

              <button
                onClick={() => {
                  const updatedJ = {
                    ...selectedJournal,
                    pinned: !selectedJournal.pinned,
                  }
                  setSelectedJournal(updatedJ);
                  saveEntry(updatedJ);
                }
              }
              >
                📌 Pin
              </button>

              {selectedJournal._id && (
                <button onClick={handleDelete}>❌ Delete</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  </>);
}
