/**
 * JWT helpers — client+server-safe (sem `import 'server-only'`), usado pelo
 * `proxy.ts` (Edge runtime) e por `src/server/services/auth.ts`.
 *
 * `jose` é Edge-compatível.
 */
import { SignJWT, jwtVerify } from 'jose';

export interface SessionPayload {
  sub: string;
  email: string;
  role: string;
  [k: string]: unknown;
}

const SESSION_COOKIE = 'jb_session';
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30d

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET ausente ou < 16 chars');
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ['HS256'] });
    if (!payload.sub || typeof payload.email !== 'string' || typeof payload.role !== 'string') {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export const SESSION = {
  cookieName: SESSION_COOKIE,
  maxAgeSec: SESSION_MAX_AGE_SEC,
} as const;
