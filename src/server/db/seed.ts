/**
 * Seed inicial — cria admin Joel + products.
 * Rodar: `pnpm db:seed`.
 *
 * Idempotente (onConflictDoNothing).
 */
import 'dotenv/config';
import { db } from './client';
import { users, products } from './schema';

async function main() {
  console.info('[seed] iniciando...');

  // Admin Joel
  const adminId = 'ADMIN_JOEL';
  await db
    .insert(users)
    .values({
      id: adminId,
      email: 'joel@joelburigo.com.br',
      name: 'Joel Burigo',
      role: 'admin',
    })
    .onConflictDoNothing();

  // Products
  const productsSeed = [
    {
      id: 'vss',
      slug: 'vendas-sem-segredos',
      name: 'Vendas Sem Segredos',
      price_cents: 199700,
      currency: 'BRL',
      recurring: false,
      access_kind: 'lifetime',
      gateway_default: 'mercado_pago',
      monthly_llm_token_quota: BigInt(500_000),
    },
    {
      id: 'advisory_sessao',
      slug: 'advisory-sessao',
      name: 'Sessão Advisory',
      price_cents: 99700,
      currency: 'BRL',
      recurring: false,
      access_kind: 'one_time',
      gateway_default: 'mercado_pago',
    },
    {
      id: 'advisory_sprint',
      slug: 'advisory-sprint',
      name: 'Sprint Advisory 30 dias',
      price_cents: 750000,
      currency: 'BRL',
      recurring: false,
      access_kind: 'one_time',
      gateway_default: 'mercado_pago',
    },
    {
      id: 'advisory_conselho',
      slug: 'advisory-conselho',
      name: 'Conselho Executivo',
      price_cents: 1500000,
      currency: 'BRL',
      recurring: true,
      access_kind: 'external',
      gateway_default: 'manual',
    },
  ] as const;

  for (const p of productsSeed) {
    await db.insert(products).values(p).onConflictDoNothing();
  }

  console.info('[seed] OK — admin + 4 products criados (ou já existiam).');
  // Evita leak de conexão
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
