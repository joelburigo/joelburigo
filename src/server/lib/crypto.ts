import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

/**
 * AES-256-GCM com chave derivada de `JWT_SECRET` via SHA-256.
 * Usado pra criptografar OAuth tokens em `calendar_accounts` (Sprint 3).
 *
 * Formato armazenado: base64(iv || ciphertext || authTag)
 *  - iv: 12 bytes (recomendação NIST pra GCM)
 *  - authTag: 16 bytes (default Node crypto)
 *
 * Não use pra dados extremamente sensíveis (senhas, dados de cartão) — o
 * propósito aqui é "secret-at-rest" pra tokens que igual têm TTL curto.
 */

const ALGO = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;

function getKey(): Buffer {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET ausente — necessário para criptografia AES (calendar_accounts)');
  }
  // SHA-256 do secret = 32 bytes ideais pra AES-256
  return createHash('sha256').update(secret).digest();
}

export function encryptSecret(plain: string): string {
  if (!plain) return '';
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, enc, tag]).toString('base64');
}

export function decryptSecret(payload: string | null | undefined): string | null {
  if (!payload) return null;
  const buf = Buffer.from(payload, 'base64');
  if (buf.length < IV_BYTES + TAG_BYTES + 1) return null;
  const iv = buf.subarray(0, IV_BYTES);
  const tag = buf.subarray(buf.length - TAG_BYTES);
  const enc = buf.subarray(IV_BYTES, buf.length - TAG_BYTES);
  const decipher = createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  try {
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}
