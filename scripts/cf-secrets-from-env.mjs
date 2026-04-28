#!/usr/bin/env node
/**
 * Bulk-upload secrets do .env local pro Cloudflare Workers env (dev ou prod).
 *
 * Uso:
 *   node scripts/cf-secrets-from-env.mjs dev
 *   node scripts/cf-secrets-from-env.mjs prod
 *
 * Pula vars que já estão em wrangler.jsonc[env.<env>.vars] e vars puramente
 * locais (DATABASE_URL — vai por Hyperdrive — PORT, NODE_ENV, etc).
 */
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const env = process.argv[2];
if (!env || !['dev', 'prod'].includes(env)) {
  console.error('Uso: node scripts/cf-secrets-from-env.mjs <dev|prod>');
  process.exit(1);
}

const SKIP = new Set([
  'NODE_ENV',
  'PORT',
  'PUBLIC_SITE_URL',
  'LLM_PROVIDER',
  'DATABASE_URL',
  'CF_ACCOUNT_ID',
  'CF_API_TOKEN',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
]);

const raw = readFileSync('.env', 'utf-8');
const secrets = {};
for (const line of raw.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const m = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (!m) continue;
  const [, key, val] = m;
  if (SKIP.has(key)) continue;
  // tira aspas redondas se existir
  const clean = val.replace(/^["'](.*)["']$/, '$1');
  if (!clean) continue;
  secrets[key] = clean;
}

const count = Object.keys(secrets).length;
if (!count) {
  console.error('Nenhum secret encontrado no .env');
  process.exit(1);
}

const tmpFile = join(tmpdir(), `cf-secrets-${Date.now()}.json`);
writeFileSync(tmpFile, JSON.stringify(secrets), { mode: 0o600 });

console.log(`Subindo ${count} secrets pro env ${env}...`);
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
