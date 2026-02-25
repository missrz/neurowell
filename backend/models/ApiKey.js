const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
  name: { type: String, required: true },
  provider: { type: String, required: true, enum: ['gemini', 'grok', 'other'] },
  key: { type: String, required: true }, // encrypted blob
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date },
  notes: { type: String }
});

module.exports = mongoose.model('ApiKey', ApiKeySchema);
