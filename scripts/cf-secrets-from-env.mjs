#!/usr/bin/env node
/**
 * Bulk-upload secrets pro Cloudflare Workers env (dev ou prod).
 *
 * Estratégia:
 *   - target=dev  → lê só .env (default local)
 *   - target=prod → mergeia .env (base) + .env.prod (override)
 *                   .env.prod só precisa ter o que MUDA em prod (JWT, MP_*, R2_*).
 *                   Tudo o mais herda de .env (analytics, Brevo, Evolution, etc).
 *
 * Uso:
 *   node scripts/cf-secrets-from-env.mjs dev
 *   node scripts/cf-secrets-from-env.mjs prod
 *
 * Pula vars que já estão em wrangler.jsonc[env.<env>.vars] e vars puramente
 * locais (DATABASE_URL → Hyperdrive, NODE_ENV, PORT, etc).
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const env = process.argv[2];
if (!env || !['dev', 'prod'].includes(env)) {
  console.error('Uso: node scripts/cf-secrets-from-env.mjs <dev|prod>');
  process.exit(1);
}

// Vars que NÃO viram secret de Worker:
// - NODE_ENV/PORT/PUBLIC_SITE_URL/LLM_PROVIDER → wrangler.jsonc[env.vars]
// - DATABASE_URL → resolvido em runtime pelo Hyperdrive binding
// - CLOUDFLARE_* → auth do wrangler CLI, irrelevante pro Worker
//
// CF_ACCOUNT_ID e CF_API_TOKEN SÃO uploaded — são lidos em runtime pelo
// service src/server/services/cf-stream.ts pra chamar Stream API.
const SKIP = new Set([
  'NODE_ENV',
  'PORT',
  'PUBLIC_SITE_URL',
  'LLM_PROVIDER',
  'DATABASE_URL',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
]);

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, 'utf-8');
  const out = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    const [, key, val] = m;
    if (SKIP.has(key)) continue;
    const clean = val.replace(/^["'](.*)["']$/, '$1');
    if (!clean) continue;
    out[key] = clean;
  }
  return out;
}

if (!existsSync('.env')) {
  console.error('❌ .env não existe. Crie a partir de .env.tpl primeiro.');
  process.exit(1);
}

const baseSecrets = parseEnvFile('.env');
let secrets = baseSecrets;

if (env === 'prod') {
  if (!existsSync('.env.prod')) {
    console.error('❌ .env.prod não existe. Use .env.prod.example como base.');
    process.exit(1);
  }
  const overrides = parseEnvFile('.env.prod');
  secrets = { ...baseSecrets, ...overrides };
  console.log(
    `Merge: ${Object.keys(baseSecrets).length} de .env + ${Object.keys(overrides).length} overrides de .env.prod`,
  );
  const overriden = Object.keys(overrides).filter((k) => k in baseSecrets);
  if (overriden.length) console.log('  sobrescritos:', overriden.sort().join(', '));
} else {
  console.log(`Lendo ${Object.keys(baseSecrets).length} secrets de .env`);
}

const count = Object.keys(secrets).length;
if (!count) {
  console.error('Nenhum secret pra subir');
  process.exit(1);
}

const tmpFile = join(tmpdir(), `cf-secrets-${Date.now()}.json`);
writeFileSync(tmpFile, JSON.stringify(secrets), { mode: 0o600 });

console.log(`\nSubindo ${count} secrets pro env ${env}...`);
console.log('Keys:', Object.keys(secrets).sort().join(', '));

try {
  execFileSync(
    'npx',
    ['-y', 'wrangler@latest', 'secret', 'bulk', tmpFile, '--env', env],
    { stdio: 'inherit' },
  );
} finally {
  unlinkSync(tmpFile);
}
