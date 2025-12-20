import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../styles/Journal.css";
import {
  getUserJournals,
  saveJournal,
  deleteJournal,
} from "../services/api";

export default function JournalPage() {
  const currentUser = useSelector((state) => state.user.user);
  const userId = currentUser?._id;
  const today = new Date().toISOString().split("T")[0];

  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [text, setText] = useState("");
  const [journal, setJournal] = useState(null);

  // =========================
  // LOAD USER JOURNALS
  // =========================
  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    const data = await getUserJournals(userId);

    if (!data) return;

    setDates([...new Set(data.map(j => j.date))]);

    const todayJournal = data.find(j => j.date === today);
    setJournal(todayJournal || null);
  };

  // =========================
  // FETCH JOURNAL BY DATE
  // =========================
  const fetchJournal = async (date) => {
    setSelectedDate(date);

    const data = await getUserJournals(userId);
    const selected = data.find(j => j.date === date);

    setJournal(selected || null);
  };

  // =========================
  // SAVE JOURNAL
  // =========================
  const saveEntry = async () => {
    if (!text.trim()) return;

    const payload = {
      userId,
      title: "My Day",
      text,
      date: selectedDate,
    };

    const saved = await saveJournal(payload);
    setJournal(saved);
    setText("");
    loadJournals();
  };

  // =========================
  // DELETE JOURNAL
  // =========================
  const handleDelete = async () => {
    if (!journal?._id) return;
    await deleteJournal(journal._id);
    setJournal(null);
    loadJournals();
  };

  return (
    <div className="journal-container">
      {/* LEFT PANEL */}
      <div className="journal-sidebar">
        <h3>📓 Journal</h3>

        <button onClick={() => fetchJournal(today)}>Today</button>

        {dates.map(d => (
          <button key={d} onClick={() => fetchJournal(d)}>
            {d}
          </button>
        ))}
      </div>

      {/* NOTEBOOK */}
      <div className="journal-page">
        <h2>{selectedDate}</h2>

        {journal && (
          <>
            <h3>{journal.title}</h3>
            <p>{journal.text}</p>
            <button onClick={handleDelete}>🗑 Delete</button>
          </>
        )}

        <textarea
          placeholder="Write freely..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={saveEntry}>Save Entry</button>
      </div>
    </div>
  );
}
