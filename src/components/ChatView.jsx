import React, { useEffect, useState, useRef } from 'react';
import { fetchChatMessages, sendChatMessage, createChat } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ChatView({ chat }) {
  const token = useSelector(s => s.user.token);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const keepListeningRef = useRef(false);
  const micTimeoutRef = useRef(null);
  const endRef = useRef(null);
  const navigate = useNavigate();

  // Text-to-speech for assistant replies
  const speak = (text) => {
    try {
      if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      const ss = window.speechSynthesis;
      ss.cancel();
      const utter = new SpeechSynthesisUtterance(String(text));
      utter.rate = 1;
      utter.pitch = 1;
      ss.speak(utter);
    } catch (e) {
      console.warn('TTS failed', e);
    }
  };

  const loadMessages = async () => {
    if (!chat || !chat._id) return;
    setLoading(true);
    try {
      const res = await fetchChatMessages(chat._id, { limit: 200 });
      setMessages(res.messages || []);
    } catch (err) {
      console.error('load messages', err);
      if (err && err.response && err.response.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, [chat && chat._id]);

  useEffect(() => {
    if (chat) setTitleInput(chat.title || '');
  }, [chat && chat.title]);

  // autosave title with debounce
  useEffect(() => {
    if (!chat || !chat._id) return;
    const original = (chat.title || '').trim();
    const current = (titleInput || '').trim();
    if (original === current) return;
    const t = setTimeout(async () => {
      try {
        const newTitle = current;
        if (newTitle.length === 0) return;
        const { updateChat } = await import('../services/api');
        await updateChat(chat._id, { title: newTitle });
        try { window.dispatchEvent(new Event('chats:updated')); } catch (e) {}
        if (chat) chat.title = newTitle;
      } catch (err) {
        console.error('autosave title', err);
      }
    }, 900);
    return () => clearTimeout(t);
  }, [titleInput, chat && chat._id]);

  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e && e.preventDefault();
    if (!input.trim()) return;
    await sendText(input);
  };

  const sendText = async (toSend) => {
    if (!toSend || sending) return;
    setSending(true);
    // optimistic UI
    setMessages((m) => [...m, { role: 'user', content: toSend }]);
    try {
      let chatIdToUse = chat && chat._id ? chat._id : null;
      // if no chat selected, create one automatically named after message
      if (!chatIdToUse) {
        if (!token) {
          navigate('/login');
          return;
        }
        const created = await createChat({ title: toSend });
        chatIdToUse = created.chat && created.chat._id;
        if (chatIdToUse) navigate(`/chats/${chatIdToUse}`);
        try { window.dispatchEvent(new Event('chats:updated')); } catch (e) {}
      }
      const res = await sendChatMessage(chatIdToUse, toSend);
      const reply = res.reply || (res.data && res.data.reply) || '...';
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      // speak assistant reply
      try { speak(reply); } catch (e) { console.warn('speak error', e); }
      try { window.dispatchEvent(new Event('chats:updated')); } catch (e) {}
      // update chat title locally if it was default
      if (chat && (!chat.title || chat.title.toLowerCase().includes('new') || chat.title.toLowerCase().includes('untitled'))) {
        const candidate = toSend.replace(/\n+/g, ' ').trim().slice(0, 80);
        if (candidate) {
          setTitleInput(candidate);
        }
      }
    } catch (err) {
      console.error('send chat message', err);
      if (err && err.response && err.response.status === 401) navigate('/login');
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, failed to send message.' }]);
    } finally {
      setSending(false);
      setInput('');
    }
  };

  // Voice input (reused from Chat.jsx)
  const startVoiceInput = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Browser does not support voice input');
      return;
    }

    // reset transcript buffer
    transcriptRef.current = '';
    keepListeningRef.current = true;

    recognitionRef.current = new SpeechRec();
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        const res = e.results[i];
        if (res.isFinal) final += (res[0].transcript || ''); else interim += (res[0].transcript || '');
      }
      // append final to transcript buffer
      if (final) {
        transcriptRef.current = (transcriptRef.current + ' ' + final).trim();
      }
      // show interim + buffer in input field so user sees live transcription
      const display = (transcriptRef.current + ' ' + interim).trim();
      setInput(display);
    };

    recognitionRef.current.onend = () => {
      // if user hasn't asked to stop, try to restart (browsers sometimes stop)
      if (keepListeningRef.current) {
        try { recognitionRef.current.start(); } catch (e) { /* ignore restart errors */ }
      } else {
        // normal stop - handled by stopVoiceInput
      }
    };

    recognitionRef.current.onerror = (ev) => {
      console.warn('speech recognition error', ev);
    };

    try {
      recognitionRef.current.start();
      setIsListening(true);
      // auto-stop after 2 minutes
      micTimeoutRef.current = setTimeout(() => {
        if (keepListeningRef.current) stopVoiceInput();
      }, 120000);
    } catch (e) {
      console.warn('failed to start recognition', e);
    }
  };

  const stopVoiceInput = () => {
    // signal we want to stop
    keepListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      try { recognitionRef.current.abort(); } catch (e) {}
    }
    clearTimeout(micTimeoutRef.current);
    setIsListening(false);
    // when stopped, send accumulated transcript if any
    const finalText = (transcriptRef.current || '').trim();
    if (finalText) {
      // send as a single message
      sendText(finalText);
      // clear transcript buffer
      transcriptRef.current = '';
      setInput('');
    }
  };

  const handleMicClick = () => {
    if (!isListening) startVoiceInput(); else stopVoiceInput();
  };

  const handleSaveTitle = async () => {
    if (!chat || !chat._id) return;
    try {
      setEditingTitle(false);
      const newTitle = (titleInput || '').trim();
      await import('../services/api').then(({ updateChat }) => updateChat(chat._id, { title: newTitle }));
      // optimistic local update
      if (chat) chat.title = newTitle;
    } catch (err) {
      console.error('update title', err);
    }
  };

  return (
    <div className="chat-view d-flex flex-column" style={{ flex: 1, maxWidth: 900 }}>
      <div className="chat-header p-3 border-bottom d-flex justify-content-between align-items-center">
        <div style={{ flex: 1 }}>
          {chat ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {!editingTitle ? (
                  <>
                    <h5 className="m-0" style={{ marginRight: 8, cursor: 'text' }} onClick={() => setEditingTitle(true)}>{chat.title || 'Chat'}</h5>
                    <button className={`mic-toggle ms-2 ${isListening ? 'listening' : ''}`} onClick={handleMicClick} aria-pressed={isListening} title={isListening ? 'Stop voice input' : 'Start voice input'}>
                      {isListening ? 'Stop' : 'Start'}
                    </button>
                  </>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      className="form-control"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onBlur={() => setEditingTitle(false)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
                    />
                  </div>
                )}
              <div style={{ marginLeft: 12 }} className="text-muted" style={{ fontSize: 12 }}>{chat && chat.participants ? `${chat.participants.length} participant(s)` : ''}</div>
            </div>
          ) : (
            <h5 className="m-0">Select a chat</h5>
          )}
        </div>
      </div>

      <div className="chat-messages p-3 flex-grow-1 overflow-auto" style={{ background: 'transparent' }}>
        {loading && <div>Loading...</div>}
        {!loading && messages.map((m, idx) => (
          <div key={idx} className={`message ${m.role === 'user' ? 'user' : 'bot'}`} style={{ marginBottom: 10 }}>
            <div className={`message-bubble ${m.role === 'user' ? 'user' : 'bot'}`}>
              <div className="message-text">{m.content}</div>
              {m.role === 'assistant' && (
                <button className="play-btn" aria-label="Play message" onClick={() => speak(m.content)}>▶</button>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form className="chat-composer p-3 border-top d-flex" onSubmit={handleSend}>
        <input className="form-control me-2" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} disabled={sending} />
        <button className="btn btn-primary" type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send'}</button>
      </form>
    </div>
  );
}
