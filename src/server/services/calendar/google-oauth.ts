import 'server-only';

// Google OAuth flow + token persistence (encrypted) pra calendar_accounts.

import { OAuth2Client } from 'google-auth-library';
import { oauth2 as googleOauth2 } from '@googleapis/oauth2';
import { and, eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { calendar_accounts } from '@/server/db/schema';
import { decryptSecret, encryptSecret } from '@/server/lib/crypto';
import { ulid } from '@/server/lib/ulid';
import { env } from '@/env';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'openid',
  'email',
];

export interface OAuthTokensPayload {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  scope?: string;
  token_type?: string;
}

export interface OAuthExchangeResult {
  tokens: OAuthTokensPayload;
  profile: { email: string; sub: string };
}

function assertConfigured() {
  if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET || !env.GOOGLE_OAUTH_REDIRECT_URI) {
    throw new Error('[calendar] GOOGLE_OAUTH_* env vars não configuradas');
  }
}

function makeOAuthClient(): OAuth2Client {
  assertConfigured();
  return new OAuth2Client({
    clientId: env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: env.GOOGLE_OAUTH_REDIRECT_URI,
  });
}

export function buildAuthUrl(state: string): string {
  const client = makeOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // garante refresh_token mesmo em re-auth
    scope: SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeCode(code: string): Promise<OAuthExchangeResult> {
  const client = makeOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.access_token) {
    throw new Error('[calendar] Google não retornou access_token');
  }
  // Pega profile via id_token decode (sem chamar API extra)
  let profileEmail = '';
  let profileSub = '';
  if (tokens.id_token) {
    const payload = decodeIdToken(tokens.id_token);
    profileEmail = String(payload.email ?? '');
    profileSub = String(payload.sub ?? '');
  }
  if (!profileEmail || !profileSub) {
    // Fallback: chama userinfo
    client.setCredentials(tokens);
    const oauth2 = googleOauth2({ version: 'v2', auth: client });
    const { data } = await oauth2.userinfo.get();
    profileEmail = data.email ?? '';
    profileSub = data.id ?? '';
  }
  return {
    tokens: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? undefined,
      expiry_date: tokens.expiry_date ?? undefined,
      scope: tokens.scope ?? undefined,
      token_type: tokens.token_type ?? undefined,
    },
    profile: { email: profileEmail, sub: profileSub },
  };
}

function decodeIdToken(idToken: string): Record<string, unknown> {
  const parts = idToken.split('.');
  if (parts.length < 2) return {};
  try {
    const json = Buffer.from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function saveTokensForUser(
  userId: string,
  payload: { tokens: OAuthTokensPayload; profile: { email: string; sub: string } }
): Promise<string> {
  const expiresAt = payload.tokens.expiry_date ? new Date(payload.tokens.expiry_date) : null;

  // Reusa account existente (mesmo provider/external) se houver
  const [existing] = await db
    .select()
    .from(calendar_accounts)
    .where(
      and(
        eq(calendar_accounts.provider, 'google'),
        eq(calendar_accounts.external_account_id, payload.profile.sub)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(calendar_accounts)
      .set({
        user_id: userId,
        email: payload.profile.email,
        access_token: encryptSecret(payload.tokens.access_token),
        // Só sobrescreve refresh_token se Google retornou um novo
        ...(payload.tokens.refresh_token
          ? { refresh_token: encryptSecret(payload.tokens.refresh_token) }
          : {}),
        scope: payload.tokens.scope ?? null,
        token_type: payload.tokens.token_type ?? null,
        expires_at: expiresAt,
        status: 'active',
        last_error: null,
        updated_at: new Date(),
      })
      .where(eq(calendar_accounts.id, existing.id));
    return existing.id;
  }

  const id = ulid();
  await db.insert(calendar_accounts).values({
    id,
    user_id: userId,
    provider: 'google',
    external_account_id: payload.profile.sub,
    email: payload.profile.email,
    access_token: encryptSecret(payload.tokens.access_token),
    refresh_token: payload.tokens.refresh_token
      ? encryptSecret(payload.tokens.refresh_token)
      : null,
    scope: payload.tokens.scope ?? null,
    token_type: payload.tokens.token_type ?? null,
    expires_at: expiresAt,
    status: 'active',
  });
  return id;
}

export async function getOAuthClientForUser(userId: string): Promise<OAuth2Client | null> {
  const [account] = await db
    .select()
    .from(calendar_accounts)
    .where(and(eq(calendar_accounts.user_id, userId), eq(calendar_accounts.status, 'active')))
    .limit(1);
  if (!account) return null;
  return await buildClientFromAccount(account.id);
}

export async function getOAuthClientForAccount(accountId: string): Promise<OAuth2Client | null> {
  return await buildClientFromAccount(accountId);
}

async function buildClientFromAccount(accountId: string): Promise<OAuth2Client | null> {
  const [account] = await db
    .select()
    .from(calendar_accounts)
    .where(eq(calendar_accounts.id, accountId))
    .limit(1);
  if (!account) return null;

  const accessToken = decryptSecret(account.access_token);
  const refreshToken = decryptSecret(account.refresh_token);
  if (!accessToken && !refreshToken) {
    console.warn('[calendar] account sem tokens decifráveis', { accountId });
    return null;
  }

  const client = makeOAuthClient();
  client.setCredentials({
    access_token: accessToken ?? undefined,
    refresh_token: refreshToken ?? undefined,
    expiry_date: account.expires_at ? account.expires_at.getTime() : undefined,
    scope: account.scope ?? undefined,
    token_type: account.token_type ?? undefined,
  });

  // Auto-persist quando google emite refresh_token novo (raro) ou novo access_token
  client.on('tokens', (newTokens: import('google-auth-library').Credentials) => {
    void persistRefreshedTokens(accountId, newTokens).catch((err) => {
      console.error('[calendar] falha ao persistir tokens refreshed', err);
    });
  });

  return client;
}

async function persistRefreshedTokens(
  accountId: string,
  tokens: { access_token?: string | null; refresh_token?: string | null; expiry_date?: number | null }
): Promise<void> {
  const update: Record<string, unknown> = { updated_at: new Date() };
  if (tokens.access_token) update.access_token = encryptSecret(tokens.access_token);
  if (tokens.refresh_token) update.refresh_token = encryptSecret(tokens.refresh_token);
  if (tokens.expiry_date) update.expires_at = new Date(tokens.expiry_date);
  if (Object.keys(update).length === 1) return; // só updated_at, no-op
  await db.update(calendar_accounts).set(update).where(eq(calendar_accounts.id, accountId));
}

export async function disconnectGoogleAccount(userId: string): Promise<void> {
  const [account] = await db
    .select()
    .from(calendar_accounts)
    .where(and(eq(calendar_accounts.user_id, userId), eq(calendar_accounts.status, 'active')))
    .limit(1);
  if (!account) return;

  // Tenta revogar no Google (best-effort)
  try {
    const client = await buildClientFromAccount(account.id);
    if (client) {
      const refreshToken = decryptSecret(account.refresh_token);
      if (refreshToken) await client.revokeToken(refreshToken);
    }
  } catch (err) {
    console.warn('[calendar] revogação Google falhou (continua disconnect local)', err);
  }

  await db
    .update(calendar_accounts)
    .set({
      status: 'revoked',
      access_token: null,
      refresh_token: null,
      sync_token: null,
      webhook_channel_id: null,
      webhook_resource_id: null,
      webhook_expires_at: null,
      updated_at: new Date(),
    })
    .where(eq(calendar_accounts.id, account.id));
}
