const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const chatWithGemini = require('../services/geminiChat');

// Create a new chat
router.post('/', auth, async (req, res) => {
  try {
    const { title, participantIds } = req.body;
    const userId = req.user && req.user.id;
    const participants = Array.isArray(participantIds) && participantIds.length ? participantIds : [userId];

    const chat = await Chat.create({ title: title || 'New chat', participants, createdBy: userId });
    res.json({ chat });
  } catch (err) {
    console.error('Create chat error', err);
    res.status(500).json({ error: 'failed to create chat' });
  }
});

// List chats for current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const chats = await Chat.find({ participants: userId }).sort({ updatedAt: -1 }).lean();
    res.json({ chats });
  } catch (err) {
    console.error('List chats error', err);
    res.status(500).json({ error: 'failed to list chats' });
  }
});

// Get messages for a chat
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user && req.user.id;
    const chat = await Chat.findById(chatId).lean();
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    if (!chat.participants.map(String).includes(String(userId))) return res.status(403).json({ error: 'Forbidden' });

    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const messages = await ChatMessage.find({ chatId }).sort({ createdAt: 1 }).limit(limit).lean();
    res.json({ messages });
  } catch (err) {
    console.error('Get messages error', err);
    res.status(500).json({ error: 'failed to get messages' });
  }
});

// Update chat metadata (title, metadata)
router.patch('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user && req.user.id;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    if (!chat.participants.map(String).includes(String(userId))) return res.status(403).json({ error: 'Forbidden' });

    const { title, metadata } = req.body;
    if (typeof title === 'string') chat.title = title.trim();
    if (metadata && typeof metadata === 'object') chat.metadata = metadata;
    await chat.save();
    res.json({ chat });
  } catch (err) {
    console.error('Update chat error', err);
    res.status(500).json({ error: 'failed to update chat' });
  }
});

// Append message (user) without calling AI
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, role } = req.body;
    const userId = req.user && req.user.id;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    if (!chat.participants.map(String).includes(String(userId))) return res.status(403).json({ error: 'Forbidden' });
    const message = await ChatMessage.create({ role: role || 'user', content, userId, chatId });
    // update chat lastMessage
    chat.lastMessage = content;
    // auto-set title if empty or default
    if (!chat.title || chat.title.toLowerCase().includes('new') || chat.title.toLowerCase().includes('untitled')) {
      try {
        const candidate = (content || '').replace(/\n+/g, ' ').trim().slice(0, 80);
        if (candidate) chat.title = candidate;
      } catch (e) {}
    }
    await chat.save();
    res.json({ message });
  } catch (err) {
    console.error('Append message error', err);
    res.status(500).json({ error: 'failed to append message' });
  }
});

// Send message to AI (persists user message and assistant reply)
router.post('/:chatId/send', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.user && req.user.id;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    if (!chat.participants.map(String).includes(String(userId))) return res.status(403).json({ error: 'Forbidden' });

    const reply = await chatWithGemini({ userId, message, chatId });

    // update chat lastMessage and possibly title
    chat.lastMessage = reply;
    if (!chat.title || chat.title.toLowerCase().includes('new') || chat.title.toLowerCase().includes('untitled')) {
      try {
        const candidate = (message || '').replace(/\n+/g, ' ').trim().slice(0, 80);
        if (candidate) chat.title = candidate;
      } catch (e) {}
    }
    await chat.save();

    res.json({ reply });
  } catch (err) {
    console.error('Chat send error', err);
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    res.status(500).json({ error: 'failed to send message' });
  }
});

module.exports = router;

