/**
 * Roteador de jobs vindos do Cloudflare Queue.
 *
 * Mantém compat com signatures pg-boss (`Job[]`) — fabricamos um array
 * single-element a partir do payload `data`.
 *
 * Producer: src/server/lib/queue.ts → env.JOBS_QUEUE.send({ job, data }).
 * Consumer: custom-worker.ts → POST /api/queue/dispatch → aqui.
 */

import type { Job } from 'pg-boss';
import {
  handlePushCalendarEvent,
  handlePullGoogleDelta,
} from './calendar-sync';
import {
  handleSendAdvisoryBookingConfirmation,
  handleSendAdvisoryReminder,
  handleScheduleAdvisoryReminders,
} from './advisory-reminders';
import { handlePublishScheduledPost } from './publish-scheduled-posts';

export const JobNames = {
  PUSH_CALENDAR_EVENT: 'PUSH_CALENDAR_EVENT',
  PULL_GOOGLE_DELTA: 'PULL_GOOGLE_DELTA',
  SEND_ADVISORY_BOOKING_CONFIRMATION: 'send-advisory-booking-confirmation',
  SEND_ADVISORY_REMINDER: 'send-advisory-reminder',
  SCHEDULE_ADVISORY_REMINDERS: 'schedule-advisory-reminders',
  PUBLISH_SCHEDULED_POST: 'publish_scheduled_post',
} as const;

function asJobs<T>(data: unknown): Job<T>[] {
  return [{ id: 'cf-queue-msg', data: data as T } as unknown as Job<T>];
}

export async function dispatchQueueJob(job: string, data: unknown): Promise<void> {
  switch (job) {
    case JobNames.PUSH_CALENDAR_EVENT:
      await handlePushCalendarEvent(asJobs(data));
      return;
    case JobNames.PULL_GOOGLE_DELTA:
      await handlePullGoogleDelta(asJobs(data));
      return;
    case JobNames.SEND_ADVISORY_BOOKING_CONFIRMATION:
      await handleSendAdvisoryBookingConfirmation(asJobs(data));
      return;
    case JobNames.SEND_ADVISORY_REMINDER:
      await handleSendAdvisoryReminder(asJobs(data));
      return;
    case JobNames.SCHEDULE_ADVISORY_REMINDERS:
      await handleScheduleAdvisoryReminders(asJobs(data));
      return;
    case JobNames.PUBLISH_SCHEDULED_POST:
      await handlePublishScheduledPost(asJobs(data));
      return;
    default:
      throw new Error(`unknown job: ${job}`);
  }
}
