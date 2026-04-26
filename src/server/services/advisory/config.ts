import 'server-only';

// Defaults pra advisory sessions + booking flow.

export const ADVISORY_DEFAULTS = {
  SESSION_DURATION_MIN: 90,
  BOOKING_TOKEN_TTL_DAYS: 30,
  REMINDER_OFFSETS_MIN: [1440, 60],
  PRODUCT_SLUGS: {
    SESSAO: 'advisory-sessao',
    SPRINT: 'advisory-sprint',
    CONSELHO: 'advisory-conselho',
  },
} as const;

export type AdvisoryProductSlug =
  (typeof ADVISORY_DEFAULTS.PRODUCT_SLUGS)[keyof typeof ADVISORY_DEFAULTS.PRODUCT_SLUGS];
