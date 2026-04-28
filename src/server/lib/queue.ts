import 'server-only';

/**
 * Queue adapter.
 *
 * Cloudflare Workers (prod): vai usar `env.QUEUE` (Cloudflare Queues) — Task #9.
 * Local Node dev: stub que loga (não enfileira).
 *
 * NOTA: esta versão é placeholder pós-migração Hetzner→CF. Na sprint de jobs
 * (`Reescrever pg-boss → Cron + Queues`), trocar pelo adapter de Queues
 * acessando o binding via `getCloudflareContext().env.QUEUE`.
 */

export interface QueueAdapter {
  enqueue<T = unknown>(job: string, data: T, opts?: { startAfter?: Date }): Promise<string | null>;
}

export const queue: QueueAdapter = {
  async enqueue(job, data, opts) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[queue] ${job} (dev stub)`, { data, startAfter: opts?.startAfter });
    } else {
      console.warn(
        `[queue] ${job} pendente — adapter Cloudflare Queues ainda não plugado (Task #9).`,
      );
    }
    return null;
  },
};
