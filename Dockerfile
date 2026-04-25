# syntax=docker/dockerfile:1.7
# ============================================================================
#  joelburigo-site — Next.js 15 standalone
#  Mesma imagem serve o HTTP server e o worker pg-boss (CMD diferente no compose).
# ============================================================================

ARG NODE_VERSION=22

# ---------- deps ----------
FROM node:${NODE_VERSION}-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && \
    if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    else echo "pnpm-lock.yaml missing" && exit 1; fi

# ---------- build ----------
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm build

# ---------- runtime ----------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=4321 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Next standalone output (server.js + .next/server + node_modules mínimos)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Arquivos extras pro worker pg-boss (compose override roda node /app/worker/runner.js)
COPY --from=builder --chown=nextjs:nodejs /app/src/server/jobs/runner.ts ./worker-src/runner.ts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg-boss ./node_modules/pg-boss
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg ./node_modules/pg

USER nextjs
EXPOSE 4321

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- "http://localhost:4321/api/health" || exit 1

# Default: HTTP server. Worker override no compose:
#   command: ["node", "--import", "tsx/esm", "worker-src/runner.ts"]
CMD ["node", "server.js"]
