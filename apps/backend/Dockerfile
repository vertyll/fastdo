ARG NODE_VERSION=24

# Base stage
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN corepack enable \
  && corepack prepare pnpm@10.25.0 --activate \
  && apk add --no-cache \
  libc6-compat \
  wget \
  netcat-openbsd \
  bash \
  coreutils \
  dos2unix

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile

COPY apps/backend ./apps/backend

# Build the application
RUN pnpm run build:backend

# Production dependencies
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --prod --frozen-lockfile --filter=backend

# Production stage
FROM node:${NODE_VERSION}-alpine AS production
WORKDIR /app

# Install runtime dependencies including netcat-openbsd and bash
RUN corepack enable \
  && corepack prepare pnpm@10.25.0 --activate \
  && apk add --no-cache \
      libc6-compat \
      wget \
      netcat-openbsd \
      bash \
      coreutils \
      dos2unix \
      busybox-extras

# Copy package files
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/turbo.json ./
COPY --from=build /app/apps/backend/package.json ./apps/backend/

# Copy built application
COPY --from=build /app/apps/backend/dist ./apps/backend/dist

# Copy necessary runtime files
COPY --from=build /app/apps/backend/src/datasource.config.ts ./apps/backend/src/
COPY --from=build /app/apps/backend/src/migrations ./apps/backend/src/migrations
COPY --from=build /app/apps/backend/src/i18n ./apps/backend/dist/i18n
COPY --from=build /app/apps/backend/src/core/mail/templates ./apps/backend/dist/core/mail/templates

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/backend/node_modules ./apps/backend/node_modules

# Copy entrypoint script

# Copy entrypoint script and create uploads directory
COPY apps/backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN dos2unix /usr/local/bin/docker-entrypoint.sh && \
  chmod +x /usr/local/bin/docker-entrypoint.sh && \
  mkdir -p /app/apps/backend/uploads && \
  chmod 755 /app/apps/backend/uploads

WORKDIR /app/apps/backend

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
