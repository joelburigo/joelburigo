import 'server-only';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

declare global {
  var __jbPgPool: pg.Pool | undefined;
}

/**
 * Lazy pool — não tenta conectar em build time se DATABASE_URL ausente.
 * Em runtime, se alguém chamar `db` sem DATABASE_URL, o pool falha no primeiro query
 * (erro claro do pg).
 */
function makePool(): pg.Pool {
  return new pg.Pool({
    connectionString: DATABASE_URL || 'postgres://placeholder',
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

const pool = globalThis.__jbPgPool ?? makePool();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__jbPgPool = pool;
}

export const db = drizzle(pool, { schema });
export { schema };
export type Db = typeof db;
