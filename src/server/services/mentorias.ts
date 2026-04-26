import 'server-only';

/**
 * Mentorias VSS — orquestração entre CF Stream Live Input + agenda interna + DB.
 *
 * Fluxo:
 *   1. createMentoria → cria CF live input + persist row + cria calendar_event (best-effort)
 *   2. Joel sobe stream via OBS → markLive() (admin button)
 *   3. Joel encerra stream → markEnded() (manual) ou webhook CF auto-completa quando replay pronto
 *   4. Webhook /api/cf-stream/webhook seta cf_playback_id + recording_ready_at
 *
 * Calendar sync é best-effort: se o serviço não tiver `upsertCalendarEvent`
 * disponível ainda (Sprint 3 em paralelo), logamos e seguimos. A row de mentoria
 * sempre é a fonte de verdade.
 */

import { eq, and, desc, asc } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { mentorias } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';
import { createLiveInput, deleteLiveInput, iframeUrlFor } from './cf-stream';

export type Mentoria = typeof mentorias.$inferSelect;
export type NewMentoria = typeof mentorias.$inferInsert;

export interface CreateMentoriaInput {
  title: string;
  topic?: string | null;
  scheduled_at: Date;
  duration_min?: number;
  ownerId: string;
  teamId?: string | null;
}

export interface UpdateMentoriaPatch {
  title?: string;
  topic?: string | null;
  scheduled_at?: Date;
  duration_min?: number;
}

// ---------- Calendar sync (best-effort) ----------

interface CalendarUpsertArgs {
  source: 'mentoria';
  sourceId: string;
  teamId: string | null;
  ownerId: string;
  title: string;
  description_md?: string | null;
  starts_at: Date;
  ends_at: Date;
  timezone: string;
  meeting_url?: string | null;
}

async function safeCalendarSync(args: CalendarUpsertArgs): Promise<void> {
  try {
    // Import dinâmico — Sprint 3 está em paralelo. Se o módulo ou export
    // não existir, cai no catch sem quebrar criação de mentoria.
    const mod = (await import('@/server/services/calendar/events')) as Record<string, unknown>;
    const upsert = mod.upsertCalendarEvent as
      | ((a: CalendarUpsertArgs) => Promise<unknown>)
      | undefined;
    if (typeof upsert === 'function') {
      await upsert(args);
      return;
    }
    console.warn(
      '[mentorias] calendar sync skipped — upsertCalendarEvent ainda não exportado de calendar/events'
    );
  } catch (err) {
    console.warn('[mentorias] calendar sync skipped', err);
  }
}

async function safeCalendarCancel(sourceId: string): Promise<void> {
  try {
    const mod = (await import('@/server/services/calendar/events')) as Record<string, unknown>;
    const cancelBySource = mod.cancelCalendarEventBySource as
      | ((s: { source: 'mentoria'; sourceId: string }) => Promise<unknown>)
      | undefined;
    if (typeof cancelBySource === 'function') {
      await cancelBySource({ source: 'mentoria', sourceId });
    } else {
      console.warn('[mentorias] calendar cancel skipped — helper indisponível');
    }
  } catch (err) {
    console.warn('[mentorias] calendar cancel skipped', err);
  }
}

// ---------- CRUD ----------

export async function createMentoria(input: CreateMentoriaInput): Promise<Mentoria> {
  const duration = input.duration_min ?? 90;
  const id = ulid();

  // Cria live input no CF (mock em dev sem token).
  let cf_live_input_id: string | null = null;
  let rtmp_url: string | null = null;
  let rtmp_stream_key: string | null = null;
  try {
    const live = await createLiveInput({ name: `Mentoria · ${input.title}` });
    cf_live_input_id = live.uid;
    rtmp_url = live.rtmps?.url ?? null;
    rtmp_stream_key = live.rtmps?.streamKey ?? null;
  } catch (err) {
    console.error('[mentorias] createLiveInput falhou — mentoria criada sem stream', err);
  }

  await db.insert(mentorias).values({
    id,
    title: input.title,
    topic: input.topic ?? null,
    scheduled_at: input.scheduled_at,
    duration_min: duration,
    cf_live_input_id,
    rtmp_url,
    rtmp_stream_key,
    live_status: 'idle',
    status: 'scheduled',
  });

  const [row] = await db.select().from(mentorias).where(eq(mentorias.id, id)).limit(1);

  await safeCalendarSync({
    source: 'mentoria',
    sourceId: id,
    teamId: input.teamId ?? null,
    ownerId: input.ownerId,
    title: input.title,
    description_md: input.topic ?? null,
    starts_at: input.scheduled_at,
    ends_at: new Date(input.scheduled_at.getTime() + duration * 60_000),
    timezone: 'America/Sao_Paulo',
    meeting_url: cf_live_input_id ? iframeUrlFor(cf_live_input_id) : null,
  });

  return row!;
}

export async function updateMentoria(
  id: string,
  patch: UpdateMentoriaPatch,
  context: { ownerId: string; teamId?: string | null }
): Promise<Mentoria | null> {
  const [existing] = await db.select().from(mentorias).where(eq(mentorias.id, id)).limit(1);
  if (!existing) return null;

  const update: Partial<typeof mentorias.$inferInsert> = {};
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.topic !== undefined) update.topic = patch.topic;
  if (patch.scheduled_at !== undefined) update.scheduled_at = patch.scheduled_at;
  if (patch.duration_min !== undefined) update.duration_min = patch.duration_min;

  if (Object.keys(update).length > 0) {
    await db.update(mentorias).set(update).where(eq(mentorias.id, id));
  }

  const [row] = await db.select().from(mentorias).where(eq(mentorias.id, id)).limit(1);
  if (!row) return null;

  await safeCalendarSync({
    source: 'mentoria',
    sourceId: id,
    teamId: context.teamId ?? null,
    ownerId: context.ownerId,
    title: row.title,
    description_md: row.topic ?? null,
    starts_at: row.scheduled_at,
    ends_at: new Date(row.scheduled_at.getTime() + row.duration_min * 60_000),
    timezone: 'America/Sao_Paulo',
    meeting_url: row.cf_live_input_id ? iframeUrlFor(row.cf_live_input_id) : null,
  });

  return row;
}

export async function deleteMentoria(id: string): Promise<boolean> {
  const [existing] = await db.select().from(mentorias).where(eq(mentorias.id, id)).limit(1);
  if (!existing) return false;

  if (existing.cf_live_input_id) {
    await deleteLiveInput(existing.cf_live_input_id);
  }

  await db.delete(mentorias).where(eq(mentorias.id, id));
  await safeCalendarCancel(id);
  return true;
}

export async function markLive(id: string): Promise<void> {
  await db.update(mentorias).set({ live_status: 'live' }).where(eq(mentorias.id, id));
}

export async function markEnded(id: string): Promise<void> {
  await db.update(mentorias).set({ live_status: 'ended' }).where(eq(mentorias.id, id));
}

// Webhook handler — idempotente
export async function markRecordingReady(input: {
  cfLiveInputId: string;
  videoUid: string;
}): Promise<number> {
  const updated = await db
    .update(mentorias)
    .set({
      cf_playback_id: input.videoUid,
      recording_ready_at: new Date(),
      live_status: 'ended',
      status: 'recorded',
    })
    .where(eq(mentorias.cf_live_input_id, input.cfLiveInputId))
    .returning({ id: mentorias.id });
  return updated.length;
}

// ---------- Reads ----------

export async function listMentorias(opts?: {
  statusFilter?: string;
}): Promise<Mentoria[]> {
  const base = db.select().from(mentorias);
  if (opts?.statusFilter) {
    return base.where(eq(mentorias.status, opts.statusFilter)).orderBy(desc(mentorias.scheduled_at));
  }
  return base.orderBy(desc(mentorias.scheduled_at));
}

export async function getMentoria(id: string): Promise<Mentoria | null> {
  const [row] = await db.select().from(mentorias).where(eq(mentorias.id, id)).limit(1);
  return row ?? null;
}

export async function listUpcomingMentorias(limit = 5): Promise<Mentoria[]> {
  return db
    .select()
    .from(mentorias)
    .where(and(eq(mentorias.status, 'scheduled')))
    .orderBy(asc(mentorias.scheduled_at))
    .limit(limit);
}
