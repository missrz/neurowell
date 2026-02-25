const crypto = require('crypto');

// Uses AES-256-GCM. Expect MASTER_KEY env var (base64 or raw string of length 32 bytes).
const MASTER_KEY = process.env.MASTER_KEY || process.env.API_MASTER_KEY || null;

if (!MASTER_KEY) {
  console.warn('WARNING: MASTER_KEY not set. API key encryption will fail in production.');
}

function getKeyBuffer() {
  if (!MASTER_KEY) return null;
  // If provided as base64, try to decode; otherwise use utf-8 and pad/truncate to 32 bytes.
  try {
    const buf = Buffer.from(MASTER_KEY, 'base64');
    if (buf.length === 32) return buf;
  } catch (e) {}
  const buf = Buffer.alloc(32);
  buf.write(MASTER_KEY, 0, 'utf8');
  return buf;
}

function encrypt(text) {
  const key = getKeyBuffer();
  if (!key) throw new Error('MASTER_KEY is not configured');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Store as base64 iv:tag:cipher
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

function decrypt(payload) {
  const key = getKeyBuffer();
  if (!key) throw new Error('MASTER_KEY is not configured');
  const parts = payload.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted payload');
  const iv = Buffer.from(parts[0], 'base64');
  const tag = Buffer.from(parts[1], 'base64');
  const encrypted = Buffer.from(parts[2], 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
