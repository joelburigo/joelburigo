import 'server-only';

/**
 * Queue adapter — Cloudflare Queues em Workers, stub em local Node dev.
 *
 * Em Workers: pega o binding `JOBS_QUEUE` via getCloudflareContext e envia
 * mensagens com formato `{ job, data }`. O consumer (custom-worker.ts →
 * dispatch.ts) roteia por nome do job.
 *
 * Em local dev (next dev): só loga. Pra testar fluxos com queue real,
 * rodar `pnpm cf:preview` (wrangler dev).
 */

export interface QueueAdapter {
  enqueue<T = unknown>(job: string, data: T, opts?: { startAfter?: Date }): Promise<string | null>;
}

interface CloudflareQueueBinding {
  send(body: unknown, opts?: { delaySeconds?: number; contentType?: 'json' }): Promise<void>;
}

function getJobsQueue(): CloudflareQueueBinding | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cf = require('@opennextjs/cloudflare');
    const ctx = cf.getCloudflareContext?.({ async: false });
    return (ctx?.env?.JOBS_QUEUE as CloudflareQueueBinding) ?? null;
  } catch {
    return null;
  }
}

export const queue: QueueAdapter = {
  async enqueue(job, data, opts) {
    const cfQueue = getJobsQueue();

    if (cfQueue) {
      const delaySeconds = opts?.startAfter
        ? Math.max(0, Math.floor((opts.startAfter.getTime() - Date.now()) / 1000))
        : undefined;
      await cfQueue.send({ job, data }, { contentType: 'json', delaySeconds });
      return null;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.info(`[queue] ${job} (dev stub)`, { data, startAfter: opts?.startAfter });
    } else {
      console.warn(`[queue] ${job} sem binding JOBS_QUEUE em runtime production.`);
    }
    return null;
  },
};
