import 'server-only';

// Sync 2-vias com Google Calendar — push de eventos locais e pull via syncToken/webhook.

import { google, type calendar_v3 } from 'googleapis';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { calendar_accounts, calendar_events } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import { env } from '@/env';
import { getOAuthClientForAccount, getOAuthClientForUser } from './google-oauth';

const GOOGLE_CALENDAR_ID = env.GOOGLE_PRIMARY_CALENDAR_ID;
const WEBHOOK_TTL_DAYS = 7;

interface AttendeePayload {
  email: string;
  name?: string;
}

function buildEventResource(input: typeof calendar_events.$inferSelect): calendar_v3.Schema$Event {
  const attendeesArr = Array.isArray(input.attendees) ? (input.attendees as AttendeePayload[]) : [];
  return {
    summary: input.title,
    description: input.description_md ?? undefined,
    start: { dateTime: input.starts_at.toISOString(), timeZone: input.timezone },
    end: { dateTime: input.ends_at.toISOString(), timeZone: input.timezone },
    location: input.location ?? input.meeting_url ?? undefined,
    visibility:
      input.visibility === 'public' || input.visibility === 'confidential'
        ? input.visibility
        : 'private',
    attendees: attendeesArr.map((a) => ({ email: a.email, displayName: a.name })),
    reminders: { useDefault: true },
    status: input.cancelled_at ? 'cancelled' : 'confirmed',
  };
}

export async function pushEventToGoogle(eventId: string): Promise<void> {
  const [event] = await db
    .select()
    .from(calendar_events)
    .where(eq(calendar_events.id, eventId))
    .limit(1);
  if (!event) {
    console.warn('[calendar] pushEventToGoogle: evento não encontrado', { eventId });
    return;
  }

  // Eventos vindos do Google não são re-sincronizados pra cima (loop guard)
  if (event.source === 'external_google') return;

  const oauth = await getOAuthClientForUser(event.owner_id);
  if (!oauth) {
    console.info('[calendar] pushEventToGoogle: usuário sem conta Google ativa', {
      ownerId: event.owner_id,
    });
    return;
  }

  const calendar = google.calendar({ version: 'v3', auth: oauth });
  const resource = buildEventResource(event);

  try {
    if (event.cancelled_at && event.google_event_id) {
      await calendar.events.delete({
        calendarId: GOOGLE_CALENDAR_ID,
        eventId: event.google_event_id,
      });
      await db
        .update(calendar_events)
        .set({ sync_status: 'synced', updated_at: new Date() })
        .where(eq(calendar_events.id, eventId));
      return;
    }

    if (event.google_event_id) {
      const { data } = await calendar.events.patch({
        calendarId: GOOGLE_CALENDAR_ID,
        eventId: event.google_event_id,
        requestBody: resource,
      });
      await db
        .update(calendar_events)
        .set({
          google_etag: data.etag ?? null,
          google_calendar_id: GOOGLE_CALENDAR_ID,
          sync_status: 'synced',
          updated_at: new Date(),
        })
        .where(eq(calendar_events.id, eventId));
      return;
    }

    const { data } = await calendar.events.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      requestBody: resource,
    });
    await db
      .update(calendar_events)
      .set({
        google_event_id: data.id ?? null,
        google_calendar_id: GOOGLE_CALENDAR_ID,
        google_etag: data.etag ?? null,
        sync_status: 'synced',
        updated_at: new Date(),
      })
      .where(eq(calendar_events.id, eventId));
  } catch (err) {
    console.error('[calendar] pushEventToGoogle falhou', { eventId, err });
    await db
      .update(calendar_events)
      .set({ sync_status: 'conflict', updated_at: new Date() })
      .where(eq(calendar_events.id, eventId));
    throw err;
  }
}

export async function deleteEventFromGoogle(eventId: string): Promise<void> {
  const [event] = await db
    .select()
    .from(calendar_events)
    .where(eq(calendar_events.id, eventId))
    .limit(1);
  if (!event || !event.google_event_id) return;

  const oauth = await getOAuthClientForUser(event.owner_id);
  if (!oauth) return;

  const calendar = google.calendar({ version: 'v3', auth: oauth });
  try {
    await calendar.events.delete({
      calendarId: GOOGLE_CALENDAR_ID,
      eventId: event.google_event_id,
    });
  } catch (err) {
    console.warn('[calendar] deleteEventFromGoogle: ignorando erro Google', { eventId, err });
  }
}

export interface PullDeltaResult {
  added: number;
  updated: number;
  deleted: number;
}

export async function pullDeltaFromGoogle(accountId: string): Promise<PullDeltaResult> {
  const [account] = await db
    .select()
    .from(calendar_accounts)
    .where(eq(calendar_accounts.id, accountId))
    .limit(1);
  if (!account || account.status !== 'active') {
    return { added: 0, updated: 0, deleted: 0 };
  }

  const oauth = await getOAuthClientForAccount(accountId);
  if (!oauth) return { added: 0, updated: 0, deleted: 0 };

  const calendar = google.calendar({ version: 'v3', auth: oauth });
  const result: PullDeltaResult = { added: 0, updated: 0, deleted: 0 };

  let pageToken: string | undefined;
  let nextSyncToken: string | undefined;
  let useInitialSync = !account.sync_token;

  // 410 (gone) = sync_token expirou → faz initial sync
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      do {
        const params: calendar_v3.Params$Resource$Events$List = {
          calendarId: GOOGLE_CALENDAR_ID,
          singleEvents: true,
          showDeleted: true,
          maxResults: 250,
          pageToken,
        };
        if (useInitialSync) {
          // Initial sync: últimos 30 dias até +180 dias
          params.timeMin = new Date(Date.now() - 30 * 24 * 3600_000).toISOString();
          params.timeMax = new Date(Date.now() + 180 * 24 * 3600_000).toISOString();
        } else {
          params.syncToken = account.sync_token ?? undefined;
        }

        const { data } = await calendar.events.list(params);
        const items = data.items ?? [];

        for (const item of items) {
          await applyGoogleItemToLocal(account.user_id, item, result);
        }

        pageToken = data.nextPageToken ?? undefined;
        if (data.nextSyncToken) nextSyncToken = data.nextSyncToken;
      } while (pageToken);
      break;
    } catch (err: unknown) {
      const e = err as { code?: number; status?: number };
      const code = e.code ?? e.status;
      if (!useInitialSync && code === 410) {
        console.warn('[calendar] sync_token expirou, refazendo initial sync', { accountId });
        useInitialSync = true;
        pageToken = undefined;
        continue;
      }
      console.error('[calendar] pullDeltaFromGoogle falhou', { accountId, err });
      await db
        .update(calendar_accounts)
        .set({
          last_error: err instanceof Error ? err.message : 'unknown',
          updated_at: new Date(),
        })
        .where(eq(calendar_accounts.id, accountId));
      throw err;
    }
  }

  await db
    .update(calendar_accounts)
    .set({
      sync_token: nextSyncToken ?? account.sync_token ?? null,
      last_sync_at: new Date(),
      last_error: null,
      updated_at: new Date(),
    })
    .where(eq(calendar_accounts.id, accountId));

  return result;
}

async function applyGoogleItemToLocal(
  ownerId: string,
  item: calendar_v3.Schema$Event,
  result: PullDeltaResult
): Promise<void> {
  if (!item.id) return;

  const [existing] = await db
    .select()
    .from(calendar_events)
    .where(eq(calendar_events.google_event_id, item.id))
    .limit(1);

  // Cancelado no Google
  if (item.status === 'cancelled') {
    if (existing && !existing.cancelled_at) {
      await db
        .update(calendar_events)
        .set({
          cancelled_at: new Date(),
          cancellation_reason: 'cancelled_in_google',
          sync_status: 'synced',
          updated_at: new Date(),
        })
        .where(eq(calendar_events.id, existing.id));
      result.deleted += 1;
    }
    return;
  }

  const startsAt = parseGoogleDate(item.start);
  const endsAt = parseGoogleDate(item.end);
  if (!startsAt || !endsAt) return;

  const timezone = item.start?.timeZone ?? item.end?.timeZone ?? 'America/Sao_Paulo';

  if (existing) {
    // Só atualiza se foi originado externo (evita loop)
    if (existing.source !== 'external_google') {
      // Foi modificado externamente um evento que nasceu local — patch metadata mas mantém source
      await db
        .update(calendar_events)
        .set({
          google_etag: item.etag ?? existing.google_etag,
          sync_status: 'synced',
          updated_at: new Date(),
        })
        .where(eq(calendar_events.id, existing.id));
      result.updated += 1;
      return;
    }
    await db
      .update(calendar_events)
      .set({
        title: item.summary ?? existing.title,
        description_md: item.description ?? existing.description_md,
        starts_at: startsAt,
        ends_at: endsAt,
        timezone,
        meeting_url: item.hangoutLink ?? existing.meeting_url,
        location: item.location ?? existing.location,
        google_etag: item.etag ?? null,
        sync_status: 'synced',
        updated_at: new Date(),
      })
      .where(eq(calendar_events.id, existing.id));
    result.updated += 1;
    return;
  }

  // Novo evento criado direto no Google
  await db.insert(calendar_events).values({
    id: ulid(),
    owner_id: ownerId,
    source: 'external_google',
    source_id: null,
    google_event_id: item.id,
    google_calendar_id: GOOGLE_CALENDAR_ID,
    google_etag: item.etag ?? null,
    sync_status: 'synced',
    title: item.summary ?? '(sem título)',
    description_md: item.description ?? null,
    starts_at: startsAt,
    ends_at: endsAt,
    timezone,
    meeting_url: item.hangoutLink ?? null,
    location: item.location ?? null,
    visibility: 'private',
    attendees: (item.attendees ?? [])
      .filter((a) => Boolean(a.email))
      .map((a) => ({ email: a.email!, name: a.displayName ?? undefined })),
  });
  result.added += 1;
}

function parseGoogleDate(d: calendar_v3.Schema$EventDateTime | undefined): Date | null {
  if (!d) return null;
  if (d.dateTime) return new Date(d.dateTime);
  if (d.date) return new Date(`${d.date}T00:00:00Z`);
  return null;
}

export async function registerWebhookChannel(accountId: string): Promise<void> {
  const oauth = await getOAuthClientForAccount(accountId);
  if (!oauth) return;
  if (!env.GOOGLE_WEBHOOK_TOKEN) {
    console.warn('[calendar] GOOGLE_WEBHOOK_TOKEN ausente — pulando webhook registration');
    return;
  }

  const calendar = google.calendar({ version: 'v3', auth: oauth });
  const channelId = ulid();
  const callbackUrl = `${env.PUBLIC_SITE_URL}/api/calendar/google/webhook`;

  try {
    const { data } = await calendar.events.watch({
      calendarId: GOOGLE_CALENDAR_ID,
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address: callbackUrl,
        token: env.GOOGLE_WEBHOOK_TOKEN,
        params: { ttl: String(WEBHOOK_TTL_DAYS * 86400) },
      },
    });

    const expiration = data.expiration
      ? new Date(Number(data.expiration))
      : new Date(Date.now() + WEBHOOK_TTL_DAYS * 86400 * 1000);

    await db
      .update(calendar_accounts)
      .set({
        webhook_channel_id: channelId,
        webhook_resource_id: data.resourceId ?? null,
        webhook_expires_at: expiration,
        updated_at: new Date(),
      })
      .where(eq(calendar_accounts.id, accountId));
  } catch (err) {
    console.error('[calendar] registerWebhookChannel falhou', { accountId, err });
    throw err;
  }
}

export async function unregisterWebhookChannel(accountId: string): Promise<void> {
  const [account] = await db
    .select()
    .from(calendar_accounts)
    .where(eq(calendar_accounts.id, accountId))
    .limit(1);
  if (!account || !account.webhook_channel_id || !account.webhook_resource_id) return;

  const oauth = await getOAuthClientForAccount(accountId);
  if (!oauth) return;

  const calendar = google.calendar({ version: 'v3', auth: oauth });
  try {
    await calendar.channels.stop({
      requestBody: {
        id: account.webhook_channel_id,
        resourceId: account.webhook_resource_id,
      },
    });
  } catch (err) {
    console.warn('[calendar] channels.stop falhou (ignorando)', { accountId, err });
  }

  await db
    .update(calendar_accounts)
    .set({
      webhook_channel_id: null,
      webhook_resource_id: null,
      webhook_expires_at: null,
      updated_at: new Date(),
    })
    .where(eq(calendar_accounts.id, accountId));
}

export async function listActiveAccountIds(): Promise<string[]> {
  const rows = await db
    .select({ id: calendar_accounts.id })
    .from(calendar_accounts)
    .where(eq(calendar_accounts.status, 'active'));
  return rows.map((r) => r.id);
}

export async function listAccountsNeedingWebhookRenewal(thresholdDate: Date): Promise<string[]> {
  const rows = await db.select().from(calendar_accounts).where(eq(calendar_accounts.status, 'active'));
  return rows
    .filter((r) => !r.webhook_expires_at || r.webhook_expires_at.getTime() < thresholdDate.getTime())
    .map((r) => r.id);
}

// Re-export usado por outras camadas (ex: futuros health checks)
export { GOOGLE_CALENDAR_ID };
