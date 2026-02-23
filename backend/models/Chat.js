const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isGroup: { type: Boolean, default: false },
  metadata: { type: Object, default: {} },
  lastMessage: { type: String, default: '' }
}, { timestamps: true });

ChatSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Chat', ChatSchema);
