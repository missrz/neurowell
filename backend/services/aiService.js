const axios = require('axios');
const apiKeyService = require('./apiKeyService');
const geminiClient = require('./geminiClient');

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:4001';

async function scoreText(text) {
  if (!text) throw new Error('text is required');

  // Try to use stored Gemini key to score text via a structured JSON prompt
  try {
    const prompt = (
      "Analyze the text below and return ONLY a valid JSON object. " +
      "Do NOT include explanations, markdown, or extra text.\n\n" +

      "Rules:\n" +
      "1. mood must be exactly one of: Happy, Sad, Neutral.\n" +
      "2. If the text expresses sadness, anger, frustration, stress, fear, or negativity, confidence MUST be low (0–3).\n" +
      "3. If the text is neutral or factual with no emotion, confidence should be mid (4–6).\n" +
      "4. Only clearly positive, optimistic, or confident text may receive high confidence (7–10).\n" +
      "5. confidence must be an integer between 0 and 10.\n" +
      "6. advice must be practical, empathetic, and specific to the mood and situation. Avoid generic advice like 'stay positive'.\n\n" +
      "7. keep score and confidence consistent with the content of the text. If the text contains mixed emotions, choose the dominant mood and adjust confidence accordingly.\n\n" +
      "8. ensure the JSON output is valid and parsable.\n\n" +
      "9. The score and confidence should be same 0-10 scale, where confidence reflects how strongly the mood is expressed in the text. For example, a very emotional text might be 'Sad' with confidence 8, while a slightly negative text might be 'Sad' with confidence 3.\n\n" +
      "Output JSON format:\n" +
      '{ "mood": "Happy|Sad|Neutral", "confidence": 0-10, "advice": "string" }\n\n' +

      `Text: "${String(text).replace(/"/g, '\\"')}"`
    );

    // Use geminiClient which handles key rotation, metrics and python fallback
    const meta = await geminiClient.runPrompt({ prompt, apiKey: null });
    const reply = meta?.reply ?? meta;
    const usedKeyLabel = meta?.usedKeyLabel || 'unknown';
    console.info(`aiService.scoreText: gemini used -> ${usedKeyLabel}`);
    // Parse response: prefer JSON object, otherwise return raw reply.
    try {
      const { tryParseJson } = require('../utils/jsonExtract');

      const extract = (s) => {
        if (!s) return null;
        if (typeof s === 'object') return s;
        const p = tryParseJson(s);
        if (p) return p;
        const m = /\{[\s\S]*\}/.exec(s);
        if (m) {
          try { return JSON.parse(m[0]); } catch (e) { return null; }
        }
        return null;
      };

      const parsed = extract(reply);
      if (parsed && typeof parsed === 'object') {
        let scoreVal = parsed.score ?? parsed.confidence ?? null;
        if (scoreVal != null) {
          const n = Number(scoreVal);
          if (!Number.isNaN(n)) {
            if (n >= 0 && n <= 1) parsed.score = Math.round(n * 10000) / 100;
            else parsed.score = Math.round(n * 100) / 100;
          } else {
            parsed.score = null;
          }
        } else {
          parsed.score = null;
        }
        return { score: parsed.score, raw: parsed };
      }

      return { score: null, raw: reply };
    } catch (e) {
      console.warn('gemini scoreText JSON extraction failed for reply:', e.message || e);
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

    // Use geminiClient which handles key rotation, metrics and python fallback
    const meta = await geminiClient.runPrompt({ prompt, apiKey: null });
    const reply = meta?.reply ?? meta;
    const usedKeyLabel = meta?.usedKeyLabel || 'unknown';
    console.info(`aiService.generateAssessment: gemini used -> ${usedKeyLabel}`);
    try {
      const { tryParseJson } = require('../utils/jsonExtract');
      let parsed = null;
      if (typeof reply === 'string') parsed = tryParseJson(reply);
      if (!parsed && typeof reply !== 'string') parsed = reply;
      if (parsed) return parsed;
      if (typeof reply === 'string') {
        parsed = JSON.parse(reply);
        return parsed;
      }
    } catch (e) {
      console.warn('gemini generateAssessment JSON extraction failed for reply:', e.message || e);
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
