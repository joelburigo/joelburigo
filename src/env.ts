import { z } from 'zod';

/**
 * Validação de env vars em tempo de boot.
 * Server-only. Import em layout.tsx ou route handler lança se config inválida.
 */

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4321),
  PUBLIC_SITE_URL: z.string().url().default('http://localhost:4321'),

  DATABASE_URL: z.string().optional(),

  LLM_PROVIDER: z.enum(['openai', 'anthropic']).default('openai'),
  LLM_MODEL_CHAT: z.string().default('gpt-5.2'),
  LLM_MODEL_PREMIUM: z.string().default('gpt-5.2'),
  LLM_MODEL_IMAGE: z.string().default('gpt-image-2'),

  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  MP_ACCESS_TOKEN: z.string().optional(),
  MP_PUBLIC_KEY: z.string().optional(),
  MP_WEBHOOK_SECRET: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  CF_ACCOUNT_ID: z.string().optional(),
  CF_API_TOKEN: z.string().optional(),
  CF_STREAM_CUSTOMER_CODE: z.string().optional(),
  R2_BUCKET: z.string().default('joelburigo-artifacts'),
  R2_PUBLIC_URL: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  BREVO_API_KEY: z.string().optional(),
  EMAIL_FROM_TRANSACTIONAL: z.string().email().default('nao-responda@joelburigo.com.br'),
  EMAIL_FROM_PERSONAL: z.string().email().default('joel@joelburigo.com.br'),
  EMAIL_FROM_NAME: z.string().default('Joel Burigo'),

  N8N_WEBHOOK_URL: z.string().url().optional(),

  JWT_SECRET: z.string().min(16).optional(),

  PUBLIC_GTM_ID: z.string().optional(),
  PUBLIC_META_PIXEL_ID: z.string().optional(),
  GA4_MEASUREMENT_ID: z.string().optional(),
  GA4_API_SECRET: z.string().optional(),
  META_CAPI_ACCESS_TOKEN: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Env inválido:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Env validation failed');
}

export const env = parsed.data;
export type Env = typeof env;
