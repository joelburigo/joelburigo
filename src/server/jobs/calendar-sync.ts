import 'server-only';

// Jobs pg-boss pra sync 2-vias com Google Calendar.

import type { Job } from 'pg-boss';
import {
  listAccountsNeedingWebhookRenewal,
  listActiveAccountIds,
  pullDeltaFromGoogle,
  pushEventToGoogle,
  registerWebhookChannel,
  unregisterWebhookChannel,
} from '@/server/services/calendar/google-sync';

export const PUSH_CALENDAR_EVENT = 'PUSH_CALENDAR_EVENT';
export const PULL_GOOGLE_DELTA = 'PULL_GOOGLE_DELTA';
export const RENEW_GOOGLE_WEBHOOK = 'RENEW_GOOGLE_WEBHOOK';

export const PULL_GOOGLE_DELTA_SCHEDULE = '*/10 * * * *'; // a cada 10 min
export const RENEW_GOOGLE_WEBHOOK_SCHEDULE = '0 2 * * *'; // 02:00 UTC diário

interface PushEventPayload {
  eventId: string;
}

interface PullDeltaPayload {
  accountId?: string;
}

export async function handlePushCalendarEvent(jobs: Job<PushEventPayload>[]): Promise<void> {
  for (const job of jobs) {
    const { eventId } = job.data ?? ({} as PushEventPayload);
    if (!eventId) continue;
    try {
      await pushEventToGoogle(eventId);
    } catch (err) {
      console.error('[calendar] PUSH_CALENDAR_EVENT falhou', { eventId, err });
      throw err;
    }
  }
}

export async function handlePullGoogleDelta(jobs: Job<PullDeltaPayload>[]): Promise<void> {
  // Se vier accountId direto (vindo de webhook), processa só ele.
  // Sem accountId (cron tick), itera todas accounts ativas.
  for (const job of jobs) {
    const targeted = job.data?.accountId;
    if (targeted) {
      try {
        await pullDeltaFromGoogle(targeted);
      } catch (err) {
        console.error('[calendar] PULL_GOOGLE_DELTA falhou', { accountId: targeted, err });
      }
      continue;
    }
    const ids = await listActiveAccountIds();
    for (const accountId of ids) {
      try {
        const result = await pullDeltaFromGoogle(accountId);
        if (result.added || result.updated || result.deleted) {
          console.info('[calendar] pull delta', { accountId, ...result });
        }
      } catch (err) {
        console.error('[calendar] PULL_GOOGLE_DELTA item falhou', { accountId, err });
      }
    }
  }
}

export async function handleRenewGoogleWebhook(_jobs: Job[]): Promise<void> {
  const threshold = new Date(Date.now() + 86400_000); // <24h pra expirar = renovar
  const ids = await listAccountsNeedingWebhookRenewal(threshold);
  for (const accountId of ids) {
    try {
      await unregisterWebhookChannel(accountId);
      await registerWebhookChannel(accountId);
      console.info('[calendar] webhook renovado', { accountId });
    } catch (err) {
      console.error('[calendar] RENEW_GOOGLE_WEBHOOK item falhou', { accountId, err });
    }
  }
}
