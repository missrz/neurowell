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

  const [journals, setJournals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [autosaveTimer, setAutosaveTimer] = useState(null);

  const draftKey = `journal_draft_${selectedDate}`;

  // =========================
  // LOAD JOURNALS OR DRAFT
  // =========================
  useEffect(() => {
    loadJournals();
  }, []);

  // =========================
  // SYNC DRAFT ACROSS TABS
  // =========================
  useEffect(() => {
    const syncDraft = (e) => {
      if (e.key === draftKey && e.newValue) {
        setSelectedJournal(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", syncDraft);
    return () => window.removeEventListener("storage", syncDraft);
  }, [draftKey]);

  const loadJournals = async () => {
    const data = await getUserJournals(userId);
    if (!data) return;

    setJournals(data);

    const todayJournal = data.find(j => j.date === today);
    if (todayJournal) {
      setSelectedJournal(todayJournal);
      return;
    }

    loadDraft(today);
  };

  // =========================
  // LOAD DRAFT (PER DATE)
  // =========================
  const loadDraft = (date) => {
    const draft = localStorage.getItem(`journal_draft_${date}`);
    if (draft) {
      setSelectedJournal(JSON.parse(draft));
    } else {
      setSelectedJournal({
        _id: null,
        title: "",
        text: "",
        date,
        pinned: false,
        isDraft: true,
      });
    }
  };

  // =========================
  // AUTO-SAVE (DEBOUNCED)
  // =========================
  const autosaveDraft = (updated) => {
    if (autosaveTimer) clearTimeout(autosaveTimer);

    const timer = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(updated));
    }, 500);

    setAutosaveTimer(timer);
  };

  // =========================
  // SAVE JOURNAL
  // =========================
  const saveEntry = async () => {
    if (!selectedJournal.title || !selectedJournal.text) return;

    const payload = {
      userId,
      title: selectedJournal.title,
      text: selectedJournal.text,
      date: selectedJournal.date,
      pinned: selectedJournal.pinned || false,
    };

    const saved = await saveJournal(payload);

    setJournals(prev => {
      const filtered = prev.filter(j => j.date !== saved.date);
      return [saved, ...filtered];
    });

    setSelectedJournal(saved);
    localStorage.removeItem(draftKey);
  };

  // =========================
  // DELETE JOURNAL
  // =========================
  const handleDelete = async () => {
    if (!selectedJournal?._id) return;

    await deleteJournal(selectedJournal._id);

    setJournals(prev =>
      prev.filter(j => j._id !== selectedJournal._id)
    );

    setSelectedJournal(null);
  };

  // =========================
  // DISCARD DRAFT
  // =========================
  const discardDraft = () => {
    localStorage.removeItem(draftKey);
    loadDraft(selectedDate);
  };

  // =========================
  // DATE CHANGE (CALENDAR)
  // =========================
  const handleDateChange = (date) => {
    setSelectedDate(date);

    const existing = journals.find(j => j.date === date);
    if (existing) {
      setSelectedJournal(existing);
    } else {
      loadDraft(date);
    }
  };

  // =========================
  // PIN JOURNAL
  // =========================
  const togglePin = () => {
    const updated = {
      ...selectedJournal,
      pinned: !selectedJournal.pinned,
    };
    setSelectedJournal(updated);
    autosaveDraft(updated);
  };

  return (
    <div className="journal-container">

      {/* LEFT PANEL */}
      <div className="journal-sidebar">
        <h3>📓 Journal</h3>
        
        {/* <button
  onClick={() =>
    document.body.classList.toggle("night-mode")
  }
>
  🌙 Night Mode
</button> */}

        {journals
          .sort((a, b) => b.pinned - a.pinned)
          .map(j => (
            <button
              key={j._id}
              className={selectedJournal?._id === j._id ? "active" : ""}
              onClick={() => {
                setSelectedDate(j.date);
                setSelectedJournal(j);
              }}
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

        {/* CALENDAR */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
        />

        {selectedJournal && (
          <>
            <input
              placeholder="Journal title"
              value={selectedJournal.title}
              onChange={(e) => {
                const updated = {
                  ...selectedJournal,
                  title: e.target.value,
                };
                setSelectedJournal(updated);
                autosaveDraft(updated);
              }}
            />

            <textarea
              placeholder="Write freely..."
              value={selectedJournal.text}
              onChange={(e) => {
                const updated = {
                  ...selectedJournal,
                  text: e.target.value,
                };
                setSelectedJournal(updated);
                autosaveDraft(updated);
              }}
            />

            <div className="journal-actions">
              <button onClick={saveEntry}>💾 Save</button>
              <button onClick={togglePin}>📌 Pin</button>
              {selectedJournal.isDraft && (
                <button onClick={discardDraft}>🗑 Discard Draft</button>
              )}
              {selectedJournal._id && (
                <button onClick={handleDelete}>❌ Delete</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
