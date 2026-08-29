import crypto from 'node:crypto';

const algorithm = 'aes-256-gcm';

function key() {
  const raw = process.env.ENCRYPTION_KEY || '';
  if (raw.length !== 64) throw new Error('ENCRYPTION_KEY must contain 64 hex characters');
  return Buffer.from(raw, 'hex');
}

export function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join('.');
}

export function decrypt(payload) {
  const [iv64, tag64, data64] = payload.split('.');
  const decipher = crypto.createDecipheriv(algorithm, key(), Buffer.from(iv64, 'base64'));
  decipher.setAuthTag(Buffer.from(tag64, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(data64, 'base64')), decipher.final()]).toString('utf8');
}
