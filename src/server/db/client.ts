import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type PostgresSql = ReturnType<typeof postgres>;
type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  // eslint-disable-next-line no-var
  var __jbPgClient: PostgresSql | undefined;
  // eslint-disable-next-line no-var
  var __jbDb: DrizzleDb | undefined;
}

function resolveConnectionString(): string {
  // Cloudflare Workers (via OpenNext): Hyperdrive binding
  try {
    // Dynamic require avoids bundling @opennextjs/cloudflare em runtimes Node
    // que não tem (tipo `tsx` direto). Falha silenciosa = cai no fallback.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cf = require('@opennextjs/cloudflare');
    const ctx = cf.getCloudflareContext?.({ async: false });
    const hyperdrive = ctx?.env?.HYPERDRIVE;
    if (hyperdrive?.connectionString) return hyperdrive.connectionString;
  } catch {
    // not in Workers runtime
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL ausente e Hyperdrive não disponível');
  }
  return url;
}

function makeClient(): PostgresSql {
  return postgres(resolveConnectionString(), {
    max: 5,
    idle_timeout: 30,
    connect_timeout: 10,
    prepare: false, // Hyperdrive não suporta prepared statements
  });
}

function getDb(): DrizzleDb {
  if (globalThis.__jbDb) return globalThis.__jbDb;
  const client = globalThis.__jbPgClient ?? makeClient();
  const instance = drizzle(client, { schema });
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__jbPgClient = client;
    globalThis.__jbDb = instance;
  }
  return instance;
}

// Proxy mantém a API `import { db }` mas adia a conexão até o primeiro uso.
// Crítico em build time (Next coleta routes sem rodar handlers) e em
// Workers (Hyperdrive binding só existe dentro do contexto da request).
export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export { schema };
export type Db = DrizzleDb;
