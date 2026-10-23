FROM node:26-bookworm-slim AS builder

ENV CI=true

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@11.9.0
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend-user/package.json apps/frontend-user/
COPY packages/api-types/package.json packages/api-types/

RUN pnpm install --frozen-lockfile --filter @mindseed/backend...

COPY packages/api-types packages/api-types
COPY apps/backend apps/backend

RUN pnpm --filter @mindseed/api-types build \
 && pnpm --filter @mindseed/backend build \
 && pnpm install --prod --frozen-lockfile --filter @mindseed/backend...

FROM node:26-bookworm-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app /app

WORKDIR /app/apps/backend
EXPOSE 8000
CMD ["node", "dist/main"]