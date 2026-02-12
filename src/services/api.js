import axios from "axios";

// In-memory token (not persisted to localStorage)
// Token kept in-memory and mirrored to sessionStorage so it survives reloads
let authToken = null;
try {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const stored = window.sessionStorage.getItem('authToken');
    if (stored) authToken = stored;
  }
} catch (e) {
  authToken = null;
}

export const setAuthToken = (token) => {
  authToken = token;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (token) window.sessionStorage.setItem('authToken', token);
      else window.sessionStorage.removeItem('authToken');
    }
  } catch (e) {
    // ignore session storage errors
  }
};

const authHeaders = () => {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};

// Determine API base URL
const API_BASE = (() => {
  // Allow explicit override at build time
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL.replace(/\/$/, '');
  // If frontend is served from port 3001 (nginx in docker compose), backend is at 4000 on host
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const port = window.location.port;
    if ((host === 'localhost' || host === '127.0.0.1') && port === '3000') {
      return 'http://localhost:4000';
    }
  }
  // Default to relative paths (works with CRA proxy in dev)
  return '';
})();

const url = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// POST text to Python backend and get prediction
export const detectMood = async (text) => {
  try {
    const res = await axios.post(url('/api/detect'), { text });
    return res.data; // { mood, confidence, advice }
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
};

// Auth endpoints
export const signup = async (name, email, password) => {
  const res = await axios.post(url('/api/auth/signup'), { name, email, password });
  return res.data; // { token, user }
};

export const login = async (email, password) => {
  const res = await axios.post(url('/api/auth/login'), { email, password });
  return res.data; // { token, user }
};

export const getMe = async () => {
  const res = await axios.get(url('/api/auth/me'), { headers: authHeaders() });
  return res.data; // { user }
};

export const logout = async () => {
  // No server-side session to destroy for JWT, client just clears token
  authToken = null;
  return { ok: true };
};


// export const fetchMoods = async (currentUser) => {
//   const res = await axios.get(url(`/api/moods/user/${currentUser._id}`), { headers: authHeaders() });
//   return res.data; // { moods }
// }

// POST localhost:4000/api/moods --
export const saveMood = async ({ moods, description, userId }) => {
  const res = await axios.post(
    url("/api/moods"),
    { moods, description, userId },
    { headers: authHeaders() }
  );
  return res.data;
};

// GET /api/moods/user/:userId

export const fetchMoodHistory = async (userId) => {
  const res = await axios.get(
    url(`/api/moods/user/${userId}`),
    { headers: authHeaders() }
  );
  return res.data;
};

// DELETE /api/moods/:id
export const deleteMood = async (moodId) => {
  const res = await axios.delete(
    url(`/api/moods/${moodId}`),
    { headers: authHeaders() }
  );
  return res.data;
};

// fetch user journals GET  /api/journals/user/:userId
export const getUserJournals = async (userId) => {
  const res = await axios.get(url(`/api/journals/user/${userId}`), { headers: authHeaders() });
  return res.data;
};

// DELETE /api/journals/:id
export const deleteJournal = async (id) => {
  const res = await axios.delete(
    url(`/api/journals/${id}`),
    { headers: authHeaders() }
  );
  return res.data;
};

// POST localhost:4000/api/journalss --
export const saveJournal = async (payload) => {
  const res = await axios.post(
    url("/api/journals"),
    { payload },
    { headers: authHeaders() }
  );
  return res.data;
};

// POST localhost:4000/api/journals/:id --
export const updateJournal = async (payload) => {
  const res = await axios.put(
    url(`/api/journals/${payload?._id}`),
    { payload },
    { headers: authHeaders() }
  );
  return res.data;
};

// Fetch aggregated analytics: /api/analytics?type=<mood|journal|valuable>&period=<day|week|month|year>
export const fetchAnalytics = async (type, period, subtype) => {
  try {
    const q = new URLSearchParams({ type, period });
    if (subtype) q.append('subtype', subtype);
    const res = await axios.get(url(`/api/analytics?${q.toString()}`), {
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    });
    return res.data; // { type, period, subtype?, data: [...] }
  } catch (err) {
    console.error('fetchAnalytics error', err);
    throw err;
  }
};
