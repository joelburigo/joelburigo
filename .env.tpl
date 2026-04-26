# ============================================================================
# joelburigo-site — template de variáveis de ambiente
#
# Em prod este arquivo é alimentado via 1Password CLI:
#   op inject -i .env.tpl -o .env
#
# Em dev local: copia pra .env.local e preenche os que você precisa testar.
# Gerenciamento: vault "Infra" no 1Password. Cada var vira um item secret.
# ============================================================================

# ----------------------------------------------------------------------------
# Runtime
# ----------------------------------------------------------------------------
NODE_ENV=production
PORT=4321
PUBLIC_SITE_URL=https://joelburigo.com.br

# ----------------------------------------------------------------------------
# Database (pg-joelburigo-site via pgbouncer em prod)
# ----------------------------------------------------------------------------
# Prod: postgres://joelburigo:${JOELBURIGO_SITE_DB_PASSWORD}@pgbouncer:6432/joelburigo
# Dev:  postgres://joelburigo:joelburigo@localhost:5432/joelburigo
DATABASE_URL="op://Infra/joelburigo-pg/database_url"

# ----------------------------------------------------------------------------
# LLM — OpenAI default, Anthropic opcional
# ----------------------------------------------------------------------------
LLM_PROVIDER=openai
LLM_MODEL_CHAT=gpt-5.2
LLM_MODEL_PREMIUM=gpt-5.2
LLM_MODEL_IMAGE=gpt-image-2

OPENAI_API_KEY="op://Infra/openai/api_key"
ANTHROPIC_API_KEY="op://Infra/anthropic/api_key"

# ----------------------------------------------------------------------------
# Pagamentos — Mercado Pago default, Stripe fallback
# ----------------------------------------------------------------------------
MP_ACCESS_TOKEN="op://Infra/joelburigo-mercadopago/access_token"
MP_PUBLIC_KEY="op://Infra/joelburigo-mercadopago/public_key"
MP_WEBHOOK_SECRET="op://Infra/joelburigo-mercadopago/webhook_secret"

STRIPE_SECRET_KEY="op://Infra/joelburigo-stripe/secret_key"
STRIPE_PUBLIC_KEY="op://Infra/joelburigo-stripe/public_key"
STRIPE_WEBHOOK_SECRET="op://Infra/joelburigo-stripe/webhook_secret"

# ----------------------------------------------------------------------------
# Cloudflare (R2 + Stream + Turnstile + DNS)
# ----------------------------------------------------------------------------
CF_ACCOUNT_ID="op://Infra/cloudflare/account_id"
CF_API_TOKEN="op://Infra/cloudflare-joelburigo/api_token"
CF_STREAM_CUSTOMER_CODE="op://Infra/cloudflare-joelburigo/stream_customer_code"

R2_BUCKET=joelburigo-artifacts
R2_PUBLIC_URL="op://Infra/cloudflare-r2/public_url"
R2_ACCESS_KEY_ID="op://Infra/cloudflare-r2/access_key_id"
R2_SECRET_ACCESS_KEY="op://Infra/cloudflare-r2/secret_access_key"

TURNSTILE_SITE_KEY="op://Infra/cloudflare-turnstile/site_key"
TURNSTILE_SECRET_KEY="op://Infra/cloudflare-turnstile/secret_key"

# ----------------------------------------------------------------------------
# Email — Brevo API (transacional via Stalwart relay em prod)
# ----------------------------------------------------------------------------
BREVO_API_KEY="op://Infra/brevo/api_key"
EMAIL_FROM_TRANSACTIONAL=nao-responda@joelburigo.com.br
EMAIL_FROM_PERSONAL=joel@joelburigo.com.br
EMAIL_FROM_NAME=Joel Burigo

# ----------------------------------------------------------------------------
# n8n (growth-infra — automações cruzadas, Slack, GA, provisionamento)
# ----------------------------------------------------------------------------
N8N_WEBHOOK_URL="op://Infra/n8n/joelburigo_webhook_url"

# ----------------------------------------------------------------------------
# Google Calendar — Sprint 3 (OAuth + sync 2-vias com /admin/agenda)
# Console: https://console.cloud.google.com/apis/credentials
# Scopes: https://www.googleapis.com/auth/calendar + .../calendar.events
# Webhook token = random validation string (openssl rand -hex 32)
# ----------------------------------------------------------------------------
GOOGLE_OAUTH_CLIENT_ID="op://Infra/joelburigo-google/oauth_client_id"
GOOGLE_OAUTH_CLIENT_SECRET="op://Infra/joelburigo-google/oauth_client_secret"
GOOGLE_OAUTH_REDIRECT_URI=https://joelburigo.com.br/api/calendar/google/callback
GOOGLE_PRIMARY_CALENDAR_ID=primary
GOOGLE_WEBHOOK_TOKEN="op://Infra/joelburigo-google/webhook_token"

# ----------------------------------------------------------------------------
# Sessão / Auth
# ----------------------------------------------------------------------------
# Base64 32 bytes: openssl rand -base64 32
JWT_SECRET="op://Infra/joelburigo-auth/jwt_secret"

# ----------------------------------------------------------------------------
# Analytics (migrados do Astro atual)
# ----------------------------------------------------------------------------
PUBLIC_GTM_ID="op://Infra/joelburigo-analytics/gtm_id"
PUBLIC_META_PIXEL_ID="op://Infra/joelburigo-analytics/meta_pixel_id"
GA4_MEASUREMENT_ID="op://Infra/joelburigo-analytics/ga4_measurement_id"
GA4_API_SECRET="op://Infra/joelburigo-analytics/ga4_api_secret"
META_CAPI_ACCESS_TOKEN="op://Infra/joelburigo-analytics/meta_capi_token"

# ----------------------------------------------------------------------------
# Monitoring (Sentry — quando ativar)
# ----------------------------------------------------------------------------
SENTRY_DSN="op://Infra/sentry-joelburigo/dsn"
