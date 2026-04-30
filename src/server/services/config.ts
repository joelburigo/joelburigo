import 'server-only';

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { app_config, app_config_audit } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';

export type ConfigNamespace = 'pricing' | 'offer' | 'email' | 'feature' | 'integration';

export const CONFIG_NAMESPACES: readonly ConfigNamespace[] = [
  'pricing',
  'offer',
  'email',
  'feature',
  'integration',
] as const;

// In-memory cache; 5min TTL é trade-off entre frescor pós-edit e custo DB em rotas hot.
// Qualquer setConfig() invalida a entrada imediatamente, então admin vê o novo valor.
// Outras instâncias do server (worker, segundo container) podem ler valor stale por até 5min.
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(ns: ConfigNamespace, key: string): string {
  return `${ns}:${key}`;
}

export async function getConfig<T>(
  namespace: ConfigNamespace,
  key: string,
  fallback: T,
): Promise<T> {
  const ck = cacheKey(namespace, key);
  const hit = cache.get(ck);
  const now = Date.now();
  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }

  const [row] = await db
    .select({ value: app_config.value })
    .from(app_config)
    .where(and(eq(app_config.namespace, namespace), eq(app_config.key, key)))
    .limit(1);

  if (!row) {
    cache.set(ck, { value: fallback, expiresAt: now + CACHE_TTL_MS });
    return fallback;
  }

  cache.set(ck, { value: row.value, expiresAt: now + CACHE_TTL_MS });
  return row.value as T;
}

export async function setConfig<T>(
  namespace: ConfigNamespace,
  key: string,
  value: T,
  userId: string,
  description?: string,
): Promise<void> {
  const [existing] = await db
    .select({ value: app_config.value })
    .from(app_config)
    .where(and(eq(app_config.namespace, namespace), eq(app_config.key, key)))
    .limit(1);

  const oldValue = existing?.value ?? null;

  await db
    .insert(app_config)
    .values({
      namespace,
      key,
      value: value as unknown,
      description: description ?? null,
      updated_by: userId,
      updated_at: new Date(),
    })
    .onConflictDoUpdate({
      target: [app_config.namespace, app_config.key],
      set: {
        value: value as unknown,
        ...(description !== undefined ? { description } : {}),
        updated_by: userId,
        updated_at: new Date(),
      },
    });

  await db.insert(app_config_audit).values({
    id: ulid(),
    namespace,
    key,
    old_value: oldValue,
    new_value: value as unknown,
    changed_by: userId,
  });

  cache.delete(cacheKey(namespace, key));
}

export async function getNamespace(ns: ConfigNamespace): Promise<
  Array<{
    key: string;
    value: unknown;
    description: string | null;
    updated_by: string | null;
    updated_at: Date;
  }>
> {
  const rows = await db
    .select({
      key: app_config.key,
      value: app_config.value,
      description: app_config.description,
      updated_by: app_config.updated_by,
      updated_at: app_config.updated_at,
    })
    .from(app_config)
    .where(eq(app_config.namespace, ns))
    .orderBy(app_config.key);

  return rows.map((r) => ({
    key: r.key,
    value: r.value,
    description: r.description,
    updated_by: r.updated_by,
    updated_at: r.updated_at,
  }));
}

export async function getAuditLog(opts?: { limit?: number; offset?: number }): Promise<
  Array<{
    id: string;
    namespace: string;
    key: string;
    old_value: unknown;
    new_value: unknown;
    changed_by: string | null;
    changed_at: Date;
  }>
> {
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 500);
  const offset = Math.max(opts?.offset ?? 0, 0);

  const rows = await db
    .select()
    .from(app_config_audit)
    .orderBy(desc(app_config_audit.changed_at))
    .limit(limit)
    .offset(offset);

  return rows.map((r) => ({
    id: r.id,
    namespace: r.namespace,
    key: r.key,
    old_value: r.old_value,
    new_value: r.new_value,
    changed_by: r.changed_by,
    changed_at: r.changed_at,
  }));
}
