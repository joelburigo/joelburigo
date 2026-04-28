/**
 * Custom Worker entrypoint — wrappa OpenNext + adiciona scheduled/queue.
 *
 * Estratégia: handlers `scheduled` e `queue` não importam código direto
 * (pra evitar conflito de bundling com `server-only` que só é desativado
 * com `react-server` condition no Next bundle). Em vez disso, fazem
 * fetch interno em endpoints `/api/cron` e `/api/queue/dispatch` —
 * ambos rodam dentro do bundle OpenNext.
 *
 * Doc: https://opennext.js.org/cloudflare/howtos/custom-worker
 */

// @ts-expect-error — gerado em build pelo @opennextjs/cloudflare
import { default as openNextHandler } from './.open-next/worker.js';

interface CronController {
  cron: string;
  scheduledTime: number;
}

interface QueueMessage<T = unknown> {
  id: string;
  timestamp: Date;
  body: T;
  ack(): void;
  retry(opts?: { delaySeconds?: number }): void;
}

interface MessageBatch<T = unknown> {
  queue: string;
  messages: QueueMessage<T>[];
  ackAll(): void;
  retryAll(opts?: { delaySeconds?: number }): void;
}

interface Env {
  PUBLIC_SITE_URL: string;
  CRON_SECRET?: string;
  [key: string]: unknown;
}

async function postInternal(
  env: Env,
  path: string,
  body: unknown,
): Promise<Response> {
  const url = new URL(path, env.PUBLIC_SITE_URL);
  return openNextHandler.fetch(
    new Request(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-cron-secret': env.CRON_SECRET ?? '',
      },
      body: JSON.stringify(body),
    }),
    env,
    { waitUntil: () => {}, passThroughOnException: () => {} } as ExecutionContext,
  );
}

export default {
  fetch: openNextHandler.fetch,

  async scheduled(event: CronController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      postInternal(env, '/api/cron', {
        cron: event.cron,
        scheduledTime: event.scheduledTime,
      }).then(async (r) => {
        if (!r.ok) console.error(`[cron] ${event.cron} HTTP ${r.status}`, await r.text());
      }),
    );
  },

  async queue(batch: MessageBatch<{ job: string; data: unknown }>, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        for (const msg of batch.messages) {
          try {
            const r = await postInternal(env, '/api/queue/dispatch', msg.body);
            if (r.ok) {
              msg.ack();
            } else {
              console.error(`[queue] ${msg.body.job} HTTP ${r.status}`, await r.text());
              msg.retry({ delaySeconds: 60 });
            }
          } catch (err) {
            console.error(`[queue] ${msg.body.job} threw:`, err);
            msg.retry({ delaySeconds: 60 });
          }
        }
      })(),
    );
  },
};
