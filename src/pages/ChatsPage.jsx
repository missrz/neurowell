import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import robotGif from '../assets/a--2.gif';
import ChatListPanel from '../components/ChatListPanel';
import ChatView from '../components/ChatView';
import { useParams } from 'react-router-dom';
import { fetchChats } from '../services/api';

export default function ChatsPage() {
  const token = useSelector(s => s.user.token);
  const [selected, setSelected] = useState(null);
  const { chatId } = useParams();

  if (!token) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    // If chatId provided via route, set it after loading chats
    const applyRoute = async () => {
      if (!chatId) return;
      try {
        const res = await fetchChats();
        const found = (res.chats || []).find(c => c._id === chatId);
        if (found) setSelected(found);
      } catch (err) {
        console.error('load chats for route select', err);
      }
    };
    applyRoute();
  }, [chatId]);

  return (
    <div className="d-flex" style={{ padding: 16, gap: 16, position: 'relative' }}>
      <img src={robotGif} alt="robot" className="robot-gif small-robot" />
      <ChatListPanel onSelect={(c) => setSelected(c)} />
      <ChatView chat={selected} />
    </div>
  );
}
