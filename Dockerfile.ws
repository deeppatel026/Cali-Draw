# ─── Stage 0: base ────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN npm install -g pnpm@9 turbo --quiet

# ─── Stage 1: prune ───────────────────────────────────────────────────────────
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune ws-backend --docker

# ─── Stage 2: install dependencies ───────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml    ./pnpm-lock.yaml
COPY --from=pruner /app/out/full/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

# ─── Stage 3: build ───────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Re-link workspace packages now that source is present alongside node_modules
RUN pnpm install --frozen-lockfile

# Generate Prisma client BEFORE tsc so @prisma/client types are available
# (ws-backend imports @repo/db which re-exports PrismaClient)
RUN pnpm --filter=@repo/db exec prisma generate

# Build all packages in dependency order
RUN turbo build --filter=ws-backend

# Create a self-contained deployment directory
RUN pnpm --filter=ws-backend deploy --prod /app/deploy/ws-backend

# Add compiled JS (pnpm deploy copies sources, not tsc output)
RUN cp -r /app/apps/ws-backend/dist /app/deploy/ws-backend/dist

# ─── Stage 4: runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 appuser

COPY --from=builder --chown=appuser:nodejs /app/deploy/ws-backend ./

USER appuser
EXPOSE 8080

CMD ["node", "dist/index.js"]
