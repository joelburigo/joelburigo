import 'server-only';
import { randomBytes } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import type { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { users, magic_links, type User } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import { env } from '@/env';
import { sendEmail } from './email';
import { magicLink as magicLinkTemplate } from './email-templates';
import { sendText as sendWhatsapp } from './whatsapp';
import { SESSION, signSession, verifySession, type SessionPayload } from '@/lib/jwt';

const MAGIC_LINK_TTL_MIN = 15;

function randomTokenSuffix(): string {
  return randomBytes(32).toString('base64url');
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Upsert idempotente por email. Usado por checkout/webhook MP pra garantir
 * que existe um `users` antes de criar purchase/entitlement.
 *
 * Se já existir: preenche name/whatsapp apenas quando o existente é null
 * (não sobrescreve dado bom com nada).
 */
export interface EnsureUserParams {
  email: string;
  name?: string | null;
  whatsapp?: string | null;
}

export async function ensureUserByEmail(params: EnsureUserParams): Promise<User> {
  const email = normalizeEmail(params.email);
  if (!email) throw new Error('ensureUserByEmail: email vazio');

  const name = params.name?.trim() || null;
  const whatsapp = params.whatsapp?.trim() || null;
  const id = ulid();

  const [row] = await db
    .insert(users)
    .values({ id, email, name, whatsapp, role: 'user' })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: sql`COALESCE(${users.name}, EXCLUDED.name)`,
        whatsapp: sql`COALESCE(${users.whatsapp}, EXCLUDED.whatsapp)`,
      },
    })
    .returning();

  if (row) return row;

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!existing) throw new Error('ensureUserByEmail: insert+select falharam');
  return existing;
}

export interface IssueMagicLinkResult {
  token: string;
  user: User;
  url: string;
}

export async function issueMagicLink(emailRaw: string): Promise<IssueMagicLinkResult> {
  const email = normalizeEmail(emailRaw);

  // Upsert user (sem nome se novo)
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  let user: User;
  if (existing) {
    user = existing;
  } else {
    const id = ulid();
    const [created] = await db
      .insert(users)
      .values({ id, email, role: 'user' })
      .returning();
    if (!created) throw new Error('failed to create user');
    user = created;
  }

  const token = `${ulid()}.${randomTokenSuffix()}`;
  const expires_at = new Date(Date.now() + MAGIC_LINK_TTL_MIN * 60_000);

  await db.insert(magic_links).values({
    token,
    user_id: user.id,
    expires_at,
  });

  const url = `${env.PUBLIC_SITE_URL}/entrar/callback?token=${encodeURIComponent(token)}`;

  return { token, user, url };
}

export async function verifyMagicLink(token: string): Promise<User> {
  const [row] = await db.select().from(magic_links).where(eq(magic_links.token, token)).limit(1);
  if (!row) throw new Error('Token inválido.');
  if (row.used_at) throw new Error('Token já utilizado.');
  if (row.expires_at.getTime() < Date.now()) throw new Error('Token expirado.');
  if (!row.user_id) throw new Error('Token sem usuário associado.');

  await db
    .update(magic_links)
    .set({ used_at: new Date() })
    .where(eq(magic_links.token, token));

  const [user] = await db
    .update(users)
    .set({ last_login_at: new Date() })
    .where(eq(users.id, row.user_id))
    .returning();
  if (!user) throw new Error('Usuário não encontrado.');

  return user;
}

export async function createSession(user: User): Promise<string> {
  return await signSession({ sub: user.id, email: user.email, role: user.role });
}

export { verifySession };
export type { SessionPayload };

export function setSessionCookie(res: NextResponse, jwt: string): void {
  res.cookies.set({
    name: SESSION.cookieName,
    value: jwt,
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: SESSION.maxAgeSec,
    path: '/',
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: SESSION.cookieName,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
}

export async function sendMagicLinkEmail(user: User, url: string): Promise<void> {
  if (env.NODE_ENV === 'development') {
    console.log(`\n[auth] Magic link para ${user.email}:\n  ${url}\n`);
    return;
  }

  const tpl = magicLinkTemplate({ url, name: user.name, ttlMin: MAGIC_LINK_TTL_MIN });

  await sendEmail({
    to: user.email,
    toName: user.name ?? undefined,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });
}

/**
 * Disparo paralelo via WhatsApp do magic link.
 *
 * NÃO é chamado pelo fluxo atual (`/api/auth/magic-link` continua só email).
 * Pronto pra Sprint 2+ chamar em paralelo a `sendMagicLinkEmail` quando
 * `user.whatsapp` existir e EvolutionAPI estiver configurada.
 *
 * Fire-and-forget: erro não propaga (whatsapp.sendText já trata).
 */
export async function sendMagicLinkWhatsapp(user: User, url: string): Promise<void> {
  if (!user.whatsapp) return;
  if (!env.EVOLUTION_API_URL || !env.EVOLUTION_API_KEY) return;

  const message =
    `Seu link de acesso ao painel do Joel Burigo (expira em ${MAGIC_LINK_TTL_MIN} min, uso único):\n\n${url}\n\n` +
    `Se você não pediu, ignore esta mensagem.`;

  try {
    await sendWhatsapp({ to: user.whatsapp, message });
  } catch (err) {
    console.error('[auth] sendMagicLinkWhatsapp falhou', err);
  }
}
