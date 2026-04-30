/**
 * scripts/migrate-cases-to-testimonials.ts
 *
 * Migra `src/data/cases.ts` (estático) → tabela `testimonials` no Postgres.
 *
 * Idempotente: skip se já existir testimonial com mesmo `client_name` e `product_used`.
 *
 * Uso:
 *   pnpm db:migrate-cases
 *   # ou:
 *   pnpm tsx --conditions=react-server scripts/migrate-cases-to-testimonials.ts
 *
 * Roda apenas em DEV — exporte DATABASE_URL apontando pro banco de dev antes.
 */
import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import { ulid } from 'ulid';
import { db } from '../src/server/db/client';
import { testimonials } from '../src/server/db/schema';
import { cases, type Case } from '../src/data/cases';

function mapProduct(produto: string): 'vss' | 'advisory' | 'both' {
  const lower = produto.toLowerCase();
  if (lower.includes('advisory')) return 'advisory';
  if (lower.includes('vendas sem segredos') || lower.includes('vss')) return 'vss';
  return 'vss';
}

function mapRevenueRange(antes: string): string | null {
  const match = antes.match(/R\$\s*([0-9]+(?:[.,][0-9]+)?)\s*(k|mil|m|M)?/i);
  if (!match) return null;
  const num = parseFloat(match[1].replace(',', '.'));
  const unit = (match[2] ?? '').toLowerCase();
  const isMillion = unit === 'm';
  const value = isMillion ? num * 1000 : num; // value em milhares
  if (value < 100) return '<100k';
  if (value < 200) return '100-200k';
  if (value < 500) return '200-500k';
  if (value < 1000) return '500k-1M';
  if (value < 5000) return '1M-5M';
  return '>5M';
}

function buildQuoteMd(c: Case): string {
  // Quote curta: situação + métrica de resultado
  return `**${c.resultado}**\n\n${c.situacaoAntes}`;
}

function buildCaseMd(c: Case): string {
  return [
    `## Situação antes`,
    c.situacaoAntes,
    ``,
    `## O que fizemos`,
    c.solucao,
    ``,
    `## Resultado`,
    `- **Antes:** ${c.antes}`,
    `- **Depois:** ${c.depois}`,
    `- **Tempo:** ${c.tempo}`,
    `- **Crescimento:** ${c.crescimento}`,
  ].join('\n');
}

async function migrate() {
  let created = 0;
  let skipped = 0;
  let errors = 0;
  let position = 0;

  for (const c of cases) {
    try {
      const product = mapProduct(c.produto);

      const existing = await db
        .select({ id: testimonials.id })
        .from(testimonials)
        .where(
          and(eq(testimonials.client_name, c.empresa), eq(testimonials.product_used, product))
        )
        .limit(1);

      if (existing.length > 0) {
        skipped += 1;
        console.info(`  ~ skip ${c.empresa} (${product}) — já existe`);
        position += 1;
        continue;
      }

      await db.insert(testimonials).values({
        id: ulid(),
        client_name: c.empresa,
        client_segment: c.nicho,
        client_revenue_range: mapRevenueRange(c.antes),
        quote_md: buildQuoteMd(c),
        result_metric: `${c.crescimento} em ${c.tempo}`,
        case_title: c.resultado,
        case_md: buildCaseMd(c),
        product_used: product,
        featured: c.badge === 'Destaque',
        published: true,
        position,
      });

      created += 1;
      position += 1;
      console.info(`  + ${c.empresa} (${product})`);
    } catch (err) {
      errors += 1;
      console.error(`  ✗ ${c.empresa}:`, err instanceof Error ? err.message : err);
    }
  }

  console.info(
    `\n[migrate-cases] ${created} criados / ${skipped} skipped / ${errors} erros (de ${cases.length})`
  );
}

migrate()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error('[migrate-cases] erro fatal:', err);
    process.exit(1);
  });
