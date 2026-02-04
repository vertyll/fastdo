ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app

RUN npm install -g pnpm && apk add --no-cache libc6-compat

# Development stage
FROM base AS development

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install

COPY . .

CMD ["pnpm", "run", "docker:dev:backend"]

# Build stage
FROM base AS build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install

COPY . .

RUN pnpm run build:backend

# Production stage
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /app

RUN npm install -g pnpm && apk add --no-cache libc6-compat

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/apps/backend/package.json ./apps/backend/
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/src/i18n ./apps/backend/dist/i18n
COPY --from=build /app/apps/backend/src/core/mail/templates ./apps/backend/dist/core/mail/templates

RUN pnpm install --prod --filter=backend

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["node", "dist/main.js"]