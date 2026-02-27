import axios from "axios";

// In-memory token (not persisted to localStorage)
// Token kept in-memory and mirrored to sessionStorage so it survives reloads
let authToken = null;

const setCookie = (name, value, days = 7) => {
  if (typeof document === 'undefined') return;
  let expires = '';
  if (days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    expires = ';expires=' + d.toUTCString();
  }
  const secure = (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') ? ';Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value || '')}${expires};path=/;SameSite=Lax${secure}`;
};

const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return matches ? decodeURIComponent(matches[1]) : null;
};

const deleteCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
};

// initialize from cookie (shared across tabs)
try {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const stored = getCookie('authToken');
    if (stored) authToken = stored;
  }
} catch (e) {
  authToken = null;
}

export const setAuthToken = (token) => {
  authToken = token;
  try {
    if (token) setCookie('authToken', token, 7);
    else deleteCookie('authToken');
  } catch (e) {
    // ignore cookie set errors
  }
};

export const getStoredAuthToken = () => authToken;
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
export const signup = async (fullName, email, password, termsAndAccepted) => {
  const res = await axios.post(url('/api/auth/signup'), { fullName, email, password, termsAndAccepted });
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

// Admin: list users
export const listUsers = async () => {
  const res = await axios.get(url('/api/users'), { headers: authHeaders() });
  return res.data; // expected: array of users
};

export const logout = async () => {
  // No server-side session to destroy for JWT, client just clears token
  authToken = null;
  try {
    deleteCookie('authToken');
  } catch (e) {}
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

// Fetch tips for a specific user: GET /api/tips/user/:userId
export const fetchUserTips = async (userId) => {
  try {
    const res = await axios.get(url(`/api/tips/user/${userId}`), {
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    });
    return res.data; // expected: array of tips or { tips: [...] }
  } catch (err) {
    console.error('fetchUserTips error', err);
    throw err;
  }
};

// Delete a tip by id: DELETE /api/tips/:tipId
export const deleteTip = async (tipId) => {
  try {
    const res = await axios.delete(url(`/api/tips/${tipId}`), {
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    });
    return res.data;
  } catch (err) {
    console.error('deleteTip error', err);
    throw err;
  }
};

// Mark a tip as read for a user: PUT /api/tips/:userId/readed/:id
export const markTipRead = async (userId, tipId) => {
  try {
    const res = await axios.put(
      url(`/api/tips/${userId}/readed/${tipId}`),
      {},
      { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
    );
    return res.data;
  } catch (err) {
    console.error('markTipRead error', err);
    throw err;
  }
};

// Assessments
export const fetchTodayAssessment = async () => {
  const res = await axios.get(url('/api/assesments/today'), { headers: authHeaders() });
  return res.data; // { _id, title, questions: [...] }
};

export const completeAssessment = async (id, answers) => {
  const res = await axios.post(url(`/api/assesments/${id}/complete`), { answers }, { headers: authHeaders() });
  return res.data; // { totalQuestions, correctCount, score, history }
};

// Admin: list all assessments
export const listAssesments = async () => {
  const res = await axios.get(url('/api/assesments'), { headers: authHeaders() });
  return res.data; // expected: array of assesments
};

// Admin: get assessment by id (includes questions)
export const getAssesment = async (id) => {
  const res = await axios.get(url(`/api/assesments/${id}`), { headers: authHeaders() });
  return res.data;
};

// Admin: delete assessment by id
export const deleteAssesment = async (id) => {
  const res = await axios.delete(url(`/api/assesments/${id}`), { headers: authHeaders() });
  return res.data;
};

// POST /api/valueble_history
export const saveValuableHistory = async ({ type, name, score }) => {
  const res = await axios.post(
    url("/api/valueble_history"),
    { type, name, score },
    { headers: authHeaders() }
  );
  return res.data;
};

// Send chat message to backend chat endpoint
export const sendChat = async (message) => {
  try {
    const res = await axios.post(url('/api/chat/send'),
    { message },
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
    );
    return res.data; // expected: { reply: '...', ... }
  } catch (err) {
    console.error('sendChat error', err);
    throw err;
  }
};

// --- Chat/Conversation APIs (chat-scoped)
export const createChat = async ({ title, participantIds } = {}) => {
  try {
    const res = await axios.post(url('/api/chats'), { title, participantIds }, { headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
    return res.data; // { chat }
  } catch (err) {
    console.error('createChat error', err);
    throw err;
  }
};

export const fetchChats = async () => {
  try {
    const res = await axios.get(url('/api/chats'), { headers: authHeaders() });
    return res.data; // { chats }
  } catch (err) {
    console.error('fetchChats error', err);
    throw err;
  }
};

export const fetchChatMessages = async (chatId, opts = {}) => {
  try {
    const q = new URLSearchParams();
    if (opts.limit) q.append('limit', String(opts.limit));
    const res = await axios.get(url(`/api/chats/${chatId}/messages${q.toString() ? '?' + q.toString() : ''}`), { headers: authHeaders() });
    return res.data; // { messages }
  } catch (err) {
    console.error('fetchChatMessages error', err);
    throw err;
  }
};

export const sendChatMessage = async (chatId, message) => {
  try {
    const res = await axios.post(url(`/api/chats/${chatId}/send`), { message }, { headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
    return res.data; // { reply }
  } catch (err) {
    console.error('sendChatMessage error', err);
    throw err;
  }
};

export const appendChatMessage = async (chatId, content, role = 'user') => {
  try {
    const res = await axios.post(url(`/api/chats/${chatId}/messages`), { content, role }, { headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
    return res.data; // { message }
  } catch (err) {
    console.error('appendChatMessage error', err);
    throw err;
  }
};

export const updateChat = async (chatId, patch) => {
  try {
    const res = await axios.patch(url(`/api/chats/${chatId}`), patch, { headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
    return res.data; // { chat }
  } catch (err) {
    console.error('updateChat error', err);
    throw err;
  }
};

// --- API Keys (admin) ---
export const listApiKeys = async () => {
  const res = await axios.get(url('/api/api-keys'), { headers: authHeaders() });
  return res.data;
};

export const createApiKey = async ({ name, provider, key, isActive=true, notes='' }) => {
  const res = await axios.post(url('/api/api-keys'), { name, provider, key, isActive, notes }, { headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
  return res.data;
};

export const getApiKey = async (id, reveal=false) => {
  const res = await axios.get(url(`/api/api-keys/${id}${reveal ? '?reveal=true' : ''}`), { headers: authHeaders() });
  return res.data;
};

export const updateApiKey = async (id, patch) => {
  const res = await axios.put(url(`/api/api-keys/${id}`), patch, { headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
  return res.data;
};

export const deleteApiKey = async (id) => {
  const res = await axios.delete(url(`/api/api-keys/${id}`), { headers: authHeaders() });
  return res.data;
};

export const validateApiKey = async (id) => {
  const res = await axios.post(url(`/api/api-keys/${id}/validate`), {}, { headers: authHeaders() });
  return res.data;
};
