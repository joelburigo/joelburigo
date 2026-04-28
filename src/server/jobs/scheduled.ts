
/**
 * Roteamento de Cron Triggers (Cloudflare scheduled handler).
 *
 * Mapeia cron expression → função handler. Os handlers aqui aceitam o
 * formato pg-boss (`Job[]`) por compatibilidade — fabricamos um array vazio
 * pra cron triggers (eles não recebem payload).
 */

import type { Job } from './types';
import { handleAgentUsageRollup } from './agent-usage-rollup';
import { handlePullGoogleDelta, handleRenewGoogleWebhook } from './calendar-sync';
import { handlePublishDuePosts } from './publish-scheduled-posts';

type CronEvent = { cron: string; scheduledTime: number };

const noJobs = [] as unknown as Job[];

export async function handleScheduled(event: CronEvent, _env: unknown): Promise<void> {
  console.info(`[cron] ${event.cron} @ ${new Date(event.scheduledTime).toISOString()}`);

  switch (event.cron) {
    case '0 3 * * *':
      await handleAgentUsageRollup(noJobs);
      return;

    case '*/15 * * * *':
      await handlePullGoogleDelta(noJobs as Job<{ accountId: string; trigger?: string }>[]);
      return;

    case '0 4 * * *':
      await handleRenewGoogleWebhook(noJobs);
      return;

    case '*/5 * * * *':
      await handlePublishDuePosts(noJobs);
      return;

    default:
      console.warn(`[cron] unknown expression: ${event.cron}`);
  }
}
