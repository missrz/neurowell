const axios = require('axios');
const apiKeyService = require('./apiKeyService');
const geminiChat = require('./geminiChat');

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:4001';

async function scoreText(text) {
  if (!text) throw new Error('text is required');

  // Try to use stored Gemini key to score text via a structured JSON prompt
  try {
    const prompt = `You are an assistant that reads a user's journal or message and returns a JSON object with keys:\n` +
      `- score: a number between 0 and 1 indicating negative affect (0 = neutral/positive, 1 = very negative),\n` +
      `- raw: original message.\n\n` +
      `Input:\n${text}\n\nRespond ONLY with valid JSON.`;

    // let geminiChat try up to 5 keys internally; do not save to chat history for scoring
    const meta = await geminiChat({ message: prompt, saveToHistory: false, returnMeta: true });
    const reply = meta?.reply ?? meta;
    const usedKeyLabel = meta?.usedKeyLabel || 'unknown';
    console.info(`aiService.scoreText: gemini used -> ${usedKeyLabel}`);
    try {
      const parsed = JSON.parse(reply);
      return parsed;
    } catch (e) {
      console.warn('gemini scoreText JSON parse failed for reply:', e.message || e);
      // Fall through to Python fallback
    }
  } catch (err) {
    console.error('Node scoring attempt failed, falling back to Python:', err.message || err);
  }

  // Fallback to Python AI server
  const url = `${AI_SERVER_URL.replace(/\/$/, '')}/score`;
  const resp = await axios.post(url, { text }, { timeout: 20000 });
  return resp.data; // { score, raw }
}

async function generateAssessment(theme, numQuestions = 5) {
  // Try Node-side generation using Gemini if available
  try {
    const prompt = `Generate an assessment JSON with fields:\n` +
      `{\n  "assessment": { "title": "string" },\n  "questions": [ { "title": "string", "options": ["", "", "", ""], "correctAnswer": "string" } ]\n}\n` +
      `Create exactly ${numQuestions} questions` + (theme ? ` themed around: ${theme}` : '') + `.` +
      ` Respond ONLY with valid JSON.`;

    const meta = await geminiChat({ message: prompt, saveToHistory: false, returnMeta: true });
    const reply = meta?.reply ?? meta;
    const usedKeyLabel = meta?.usedKeyLabel || 'unknown';
    console.info(`aiService.generateAssessment: gemini used -> ${usedKeyLabel}`);
    try {
      const parsed = JSON.parse(reply);
      return parsed;
    } catch (e) {
      console.warn('gemini generateAssessment JSON parse failed for reply:', e.message || e);
      // Fall through to Python fallback
    }
  } catch (err) {
    console.error('Node assessment generation failed, falling back to Python:', err.message || err);
  }

  // Fallback to Python AI server
  const url = `${AI_SERVER_URL.replace(/\/$/, '')}/assessment/generate`;
  const payload = { numQuestions };
  if (theme) payload.theme = theme;
  const resp = await axios.post(url, payload, { timeout: 30000 });
  return resp.data; // { assessment, questions, raw }
}

module.exports = { scoreText, generateAssessment };
