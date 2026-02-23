import React, { useEffect, useState } from 'react';
import { fetchChats, createChat } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Chat.css';

export default function ChatListPanel({ onSelect }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { chatId: routeChatId } = useParams();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchChats();
      setChats(res.chats || []);
    } catch (err) {
      console.error('load chats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const handler = () => load();
    window.addEventListener('chats:updated', handler);
    return () => window.removeEventListener('chats:updated', handler);
  }, []);

  const handleNew = async () => {
    try {
      const res = await createChat({ title: 'New Chat' });
      const chat = res.chat;
      setChats((c) => [chat, ...c]);
      if (onSelect) onSelect(chat);
      navigate(`/chats/${chat._id}`);
    } catch (err) {
      console.error('create chat', err);
    }
  };

  return (
    <div className="chat-list-panel p-3">
      <div className="chat-list-header d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Chats</h5>
        <button className="btn btn-sm btn-outline-primary" onClick={handleNew}>New</button>
      </div>

      <div className="chat-list overflow-auto">
        {loading && <div className="text-muted">Loading...</div>}
        {!loading && chats.length === 0 && <div className="text-muted">No chats yet</div>}
        {chats.map((c) => {
          const active = routeChatId && String(routeChatId) === String(c._id);
          const preview = c.lastMessage ? String(c.lastMessage).replace(/\s+/g, ' ').trim() : '';
          const words = preview ? preview.split(' ') : [];
          const short = words.slice(0, 5).join(' ');
          const more = words.length > 5;
          return (
            <div key={c._id} className={`chat-list-item p-2 d-flex align-items-center ${active ? 'active' : ''}`} onClick={() => { if (onSelect) onSelect(c); navigate(`/chats/${c._id}`); }}>
              <div className="chat-avatar" aria-hidden />
              <div className="chat-meta" style={{ flex: 1 }}>
                <div className="chat-title">{c.title || 'Untitled'}</div>
                <div className="chat-last">{preview ? (short + (more ? '...' : '')) : 'No messages yet'}</div>
              </div>
              <div className="chat-time" style={{ marginLeft: 8, fontSize: 12 }}>{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
