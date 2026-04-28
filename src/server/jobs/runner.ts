/**
 * Worker runner — executado em processo separado no docker-compose
 * (serviço `joelburigo-worker`, mesma imagem do Next, CMD=node dist/.../runner.js).
 *
 * Sprint 0: scaffold mínimo. Handlers reais em Sprint 1/2.
 * Sprint 3: jobs de calendar sync + advisory reminders.
 */
import { PgBoss } from 'pg-boss';
import {
  AGENT_USAGE_ROLLUP,
  handleAgentUsageRollup,
  schedule as agentUsageRollupSchedule,
} from './agent-usage-rollup';
import {
  PUSH_CALENDAR_EVENT,
  PULL_GOOGLE_DELTA,
  RENEW_GOOGLE_WEBHOOK,
  PULL_GOOGLE_DELTA_SCHEDULE,
  RENEW_GOOGLE_WEBHOOK_SCHEDULE,
  handlePushCalendarEvent,
  handlePullGoogleDelta,
  handleRenewGoogleWebhook,
} from './calendar-sync';
import {
  SEND_ADVISORY_BOOKING_CONFIRMATION,
  SEND_ADVISORY_REMINDER,
  SCHEDULE_ADVISORY_REMINDERS,
  handleSendAdvisoryBookingConfirmation,
  handleSendAdvisoryReminder,
  handleScheduleAdvisoryReminders,
} from './advisory-reminders';
// ===== blog scheduled =====
import {
  PUBLISH_SCHEDULED_POST,
  PUBLISH_DUE_POSTS,
  PUBLISH_DUE_POSTS_SCHEDULE,
  handlePublishScheduledPost,
  handlePublishDuePosts,
} from './publish-scheduled-posts';

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

  // pg-boss v12 exige criar a queue antes de work/schedule
  const queues = [
    AGENT_USAGE_ROLLUP,
    PUSH_CALENDAR_EVENT,
    PULL_GOOGLE_DELTA,
    RENEW_GOOGLE_WEBHOOK,
    SEND_ADVISORY_BOOKING_CONFIRMATION,
    SEND_ADVISORY_REMINDER,
    SCHEDULE_ADVISORY_REMINDERS,
    PUBLISH_SCHEDULED_POST,
    PUBLISH_DUE_POSTS,
  ];
  for (const name of queues) {
    await boss.createQueue(name);
  }

  // Sprint 2: agent usage rollup (diário 03:00 UTC)
  await boss.work(AGENT_USAGE_ROLLUP, handleAgentUsageRollup);
  await boss.schedule(AGENT_USAGE_ROLLUP, agentUsageRollupSchedule);

  // Sprint 3: calendar sync (Google Calendar 2-way)
  await boss.work(PUSH_CALENDAR_EVENT, handlePushCalendarEvent);
  await boss.work(PULL_GOOGLE_DELTA, handlePullGoogleDelta);
  await boss.work(RENEW_GOOGLE_WEBHOOK, handleRenewGoogleWebhook);
  await boss.schedule(PULL_GOOGLE_DELTA, PULL_GOOGLE_DELTA_SCHEDULE);
  await boss.schedule(RENEW_GOOGLE_WEBHOOK, RENEW_GOOGLE_WEBHOOK_SCHEDULE);

  // Sprint 3: advisory reminders + booking confirmations
  await boss.work(SEND_ADVISORY_BOOKING_CONFIRMATION, handleSendAdvisoryBookingConfirmation);
  await boss.work(SEND_ADVISORY_REMINDER, handleSendAdvisoryReminder);
  await boss.work(SCHEDULE_ADVISORY_REMINDERS, handleScheduleAdvisoryReminders);

  // ===== blog scheduled =====
  // Sprint 4: blog scheduled publish (job individual + cron de fallback 5min)
  await boss.work(PUBLISH_SCHEDULED_POST, handlePublishScheduledPost);
  await boss.work(PUBLISH_DUE_POSTS, handlePublishDuePosts);
  await boss.schedule(PUBLISH_DUE_POSTS, PUBLISH_DUE_POSTS_SCHEDULE);

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
