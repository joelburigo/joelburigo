/**
 * Worker runner — executado em processo separado no docker-compose
 * (serviço `joelburigo-worker`, mesma imagem do Next, CMD=node dist/.../runner.js).
 *
 * Sprint 0: scaffold mínimo. Handlers reais em Sprint 1/2.
 */
import { PgBoss } from 'pg-boss';
import {
  AGENT_USAGE_ROLLUP,
  handleAgentUsageRollup,
  schedule as agentUsageRollupSchedule,
} from './agent-usage-rollup';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[worker] DATABASE_URL ausente. Worker não vai iniciar.');
  process.exit(1);
}

async function main() {
  const boss = new PgBoss({
    connectionString: DATABASE_URL,
    schema: 'pgboss',
  });

  boss.on('error', (err) => {
    console.error('[worker] pg-boss error:', err);
  });

  await boss.start();
  console.info('[worker] pg-boss started, aguardando jobs...');

  // Sprint 2: agent usage rollup (diário 03:00 UTC)
  await boss.work(AGENT_USAGE_ROLLUP, handleAgentUsageRollup);
  await boss.schedule(AGENT_USAGE_ROLLUP, agentUsageRollupSchedule);

  // TODO Sprint 1: registrar handlers
  // await boss.work('welcome_vss', welcomeVss);
  // await boss.work('welcome_advisory', welcomeAdvisory);
  // await boss.work('forward_form_n8n', forwardFormN8n);
  // await boss.work('publish_scheduled_posts', publishScheduledPosts);
  // await boss.work('process_blog_image', processBlogImage);
  // await boss.work('classify_blog_posts', classifyBlogPosts);
  // await boss.work('consolidate_phase', consolidatePhase);
  // await boss.work('aggregate_agent_usage', aggregateAgentUsage);

  // Graceful shutdown — espera jobs em flight terminarem
  const shutdown = async (signal: string) => {
    console.info(`[worker] ${signal} recebido, parando...`);
    await boss.stop({ graceful: true });
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('[worker] fatal:', err);
  process.exit(1);
});
