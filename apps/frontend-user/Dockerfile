FROM node:26-bookworm-slim AS builder

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@11.9.0
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend-user/package.json apps/frontend-user/
COPY packages/api-types/package.json packages/api-types/

RUN pnpm install --frozen-lockfile --filter @mindseed/frontend-user...

COPY packages/api-types packages/api-types
COPY apps/frontend-user apps/frontend-user

RUN test -n "$VITE_API_BASE_URL" || (echo "VITE_API_BASE_URL is required" && exit 1)
RUN pnpm --filter @mindseed/api-types build \
 && pnpm --filter @mindseed/frontend-user build

FROM nginx:1.29-alpine

COPY apps/frontend-user/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/frontend-user/dist /usr/share/nginx/html

EXPOSE 80