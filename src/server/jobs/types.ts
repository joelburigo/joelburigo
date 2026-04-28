/**
 * Tipo mínimo compatível com `pg-boss.Job` pra manter os handlers atuais
 * funcionando depois da migração pra Cloudflare Queues + Cron Triggers.
 *
 * Os handlers iteram sobre arrays de Job; os dispatchers (scheduled.ts e
 * dispatch.ts) fabricam arrays de 1 elemento a partir do payload do CF.
 */
export interface Job<T = unknown> {
  id: string;
  data: T;
}
