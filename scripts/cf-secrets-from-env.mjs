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
// - WRANGLER_TOKEN → usado SÓ por este script pra auth do wrangler (não vai pro Worker)
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
  'WRANGLER_TOKEN',
]);

function parseEnvFile(path, { includeSkipped = false } = {}) {
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, 'utf-8');
  const out = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    const [, key, val] = m;
    if (!includeSkipped && SKIP.has(key)) continue;
    const clean = val.replace(/^["'](.*)["']$/, '$1');
    if (!clean) continue;
    out[key] = clean;
  }
  return out;
}

// Precedência: .env.prod > .env.local > .env > process.env.
function loadWranglerToken() {
  const sources = ['.env.prod', '.env.local', '.env'];
  for (const src of sources) {
    const v = parseEnvFile(src, { includeSkipped: true })?.WRANGLER_TOKEN;
    if (v) return v;
  }
  return process.env.WRANGLER_TOKEN || null;
}

if (!existsSync('.env')) {
  console.error('❌ .env não existe. Crie a partir de .env.tpl primeiro.');
  process.exit(1);
}

// Precedência (último vence): .env → .env.local → .env.prod (só se prod)
const layers = [
  ['.env', parseEnvFile('.env')],
  ['.env.local', parseEnvFile('.env.local')],
];
if (env === 'prod') {
  if (!existsSync('.env.prod')) {
    console.error('❌ .env.prod não existe. Use .env.prod.example como base.');
    process.exit(1);
  }
  layers.push(['.env.prod', parseEnvFile('.env.prod')]);
}

const secrets = {};
for (const [name, vars] of layers) {
  const overlap = Object.keys(vars).filter((k) => k in secrets);
  Object.assign(secrets, vars);
  console.log(
    `${name}: +${Object.keys(vars).length}` +
      (overlap.length ? ` (sobrescreve ${overlap.length}: ${overlap.sort().join(', ')})` : ''),
  );
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

// Wrangler precisa de auth com perm Workers Scripts:Edit. Estratégia:
//
// 1. Se WRANGLER_TOKEN estiver setado → usa ele (token deploy do GH Actions)
// 2. Senão, tenta OAuth do `wrangler login`
//
// Limpa CF_API_TOKEN/CF_ACCOUNT_ID do shell — pode ser escopo restrito
// (Stream/R2) que wrangler tenta usar como auth e quebra.
const cleanEnv = { ...process.env };
delete cleanEnv.CF_API_TOKEN;
delete cleanEnv.CF_ACCOUNT_ID;
delete cleanEnv.CLOUDFLARE_API_TOKEN;
delete cleanEnv.CLOUDFLARE_ACCOUNT_ID;

const wranglerToken = loadWranglerToken();
if (wranglerToken) {
  cleanEnv.CLOUDFLARE_API_TOKEN = wranglerToken;
  cleanEnv.CLOUDFLARE_ACCOUNT_ID = '9a7483a31b88e0985db3ad85c685e223';
  console.log('Usando WRANGLER_TOKEN pra auth');
} else {
  console.log('Sem WRANGLER_TOKEN — vai usar OAuth do `wrangler login`');
  console.log('  (se falhar com 9106, adiciona WRANGLER_TOKEN=... no .env)');
}

try {
  execFileSync(
    'npx',
    ['-y', 'wrangler@latest', 'secret', 'bulk', tmpFile, '--env', env],
    { stdio: 'inherit', env: cleanEnv },
  );
} finally {
  unlinkSync(tmpFile);
}
