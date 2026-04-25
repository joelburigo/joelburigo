import 'server-only';

/**
 * Queue adapter — pg-boss em prod, in-memory stub em dev sem DB.
 *
 * Worker consume via src/server/jobs/runner.ts (processo separado no compose).
 */

export interface QueueAdapter {
  enqueue<T = unknown>(job: string, data: T, opts?: { startAfter?: Date }): Promise<string | null>;
}

type PgBoss = Awaited<ReturnType<typeof makeBoss>>;

async function makeBoss() {
  if (!process.env.DATABASE_URL) return null;
  const { default: PgBoss } = await import('pg-boss');
  const boss = new PgBoss({
    connectionString: process.env.DATABASE_URL,
    schema: 'pgboss',
  });
  await boss.start();
  return boss;
}

declare global {
  // eslint-disable-next-line no-var
  var __jbPgBoss: Promise<PgBoss> | undefined;
}

function getBoss(): Promise<PgBoss> {
  if (!globalThis.__jbPgBoss) globalThis.__jbPgBoss = makeBoss();
  return globalThis.__jbPgBoss;
}

export const queue: QueueAdapter = {
  async enqueue(job, data, opts) {
    const boss = await getBoss();
    if (!boss) {
      // Sem DB, no-op (dev).
      if (process.env.NODE_ENV !== 'production') {
        console.info(`[queue] ${job} (dev stub, not enqueued)`, data);
      }
      return null;
    }
    return boss.send(job, data as object, { startAfter: opts?.startAfter });
  },
};
