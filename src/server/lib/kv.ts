import 'server-only';
import { eq, lt } from 'drizzle-orm';
import { db } from '../db/client';
import { kv_store } from '../db/schema';

/**
 * KV adapter — impl Postgres `kv_store`. Troca pra CF KV binding na Fase B.
 * Uso: sessions, rate-limit, cache hot.
 */

export interface KvAdapter {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, ttlSec?: number): Promise<void>;
  delete(key: string): Promise<void>;
  cleanup(): Promise<number>;
}

export const kv: KvAdapter = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const [row] = await db.select().from(kv_store).where(eq(kv_store.key, key)).limit(1);
    if (!row) return null;
    if (row.expires_at && row.expires_at.getTime() < Date.now()) {
      await db.delete(kv_store).where(eq(kv_store.key, key));
      return null;
    }
    return row.value as T;
  },

  async set<T = unknown>(key: string, value: T, ttlSec?: number): Promise<void> {
    const expires_at = ttlSec ? new Date(Date.now() + ttlSec * 1000) : null;
    await db
      .insert(kv_store)
      .values({ key, value: value as object, expires_at })
      .onConflictDoUpdate({
        target: kv_store.key,
        set: { value: value as object, expires_at },
      });
  },

  async delete(key: string): Promise<void> {
    await db.delete(kv_store).where(eq(kv_store.key, key));
  },

  async cleanup(): Promise<number> {
    const rows = await db.delete(kv_store).where(lt(kv_store.expires_at, new Date())).returning();
    return rows.length;
  },
};
