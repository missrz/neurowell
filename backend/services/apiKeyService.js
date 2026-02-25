const ApiKey = require('../models/ApiKey');
const { encrypt, decrypt } = require('../utils/encryption');

async function createApiKey({ name, provider, key, isActive=true, createdBy=null, notes='' }){
  const encrypted = encrypt(key);
  const doc = new ApiKey({ name, provider, key: encrypted, isActive, createdBy, notes });
  await doc.save();
  return doc;
}

async function listApiKeys(){
  // Return metadata only (do not return raw key)
  return ApiKey.find({}, '-key').sort({ createdAt: -1 }).lean();
}

async function getApiKey(id, { reveal=false } = {}){
  const doc = await ApiKey.findById(id);
  if (!doc) return null;
  const out = doc.toObject();
  if (reveal) {
    out.key = decrypt(doc.key);
  } else {
    delete out.key;
  }
  return out;
}

async function updateApiKey(id, patch){
  if (patch.key) {
    patch.key = encrypt(patch.key);
  }
  const doc = await ApiKey.findByIdAndUpdate(id, patch, { new: true });
  return doc;
}

async function deleteApiKey(id){
  return ApiKey.findByIdAndDelete(id);
}

async function getActiveKey(provider){
  const doc = await ApiKey.findOne({ provider, isActive: true }).sort({ createdAt: -1 });
  if (!doc) return null;
  return { id: doc._id, key: decrypt(doc.key), provider: doc.provider };
}

async function getActiveKeys(provider, limit = 5){
  const docs = await ApiKey.find({ provider, isActive: true }).sort({ createdAt: -1 }).limit(limit);
  return docs.map(d => ({ id: d._id, key: decrypt(d.key), provider: d.provider }));
}

async function touchLastUsed(id){
  return ApiKey.findByIdAndUpdate(id, { lastUsedAt: new Date() });
}

async function validateKey(id){
  const doc = await ApiKey.findById(id);
  if (!doc) throw new Error('ApiKey not found');

  const provider = doc.provider;
  const decrypted = decrypt(doc.key);

  if (provider === 'gemini') {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const gen = new GoogleGenerativeAI(decrypted);
      const model = gen.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
      // Minimal test prompt that should succeed if key is valid
      const testPrompt = 'Please respond with the single word: OK';
      const result = await model.generateContent(testPrompt);
      const text = result?.response?.text ? result.response.text() : null;
      return { ok: true, provider: 'gemini', sample: text };
    } catch (err) {
      return { ok: false, provider: 'gemini', message: err.message || String(err) };
    }
  }

  // For other providers we have no implementation yet
  return { ok: false, message: `Validation not implemented for provider: ${provider}` };
}

module.exports = { createApiKey, listApiKeys, getApiKey, updateApiKey, deleteApiKey, getActiveKey, getActiveKeys, touchLastUsed, validateKey };
