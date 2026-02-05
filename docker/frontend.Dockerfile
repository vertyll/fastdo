ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app

RUN npm install -g pnpm && apk add --no-cache libc6-compat

# Development stage
FROM base AS development

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install

COPY . .

CMD ["pnpm", "run", "docker:dev:frontend"]

# Build stage
FROM base AS build

ARG BACKEND_URL=http://localhost:3000
ARG DOMAIN=localhost:4200
ARG API_KEY=dev-api-key

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install

COPY . .

RUN echo "export const environment = { \
  production: true, \
  backendUrl: '${BACKEND_URL}', \
  domain: '${DOMAIN}', \
  apiKey: '${API_KEY}', \
  defaultLanguage: 'pl', \
  availableLanguages: ['pl', 'en'], \
  refreshToken: { bufferTime: 60000 } \
};" > apps/frontend/src/environments/environment.prod.ts

RUN pnpm run build:frontend

# Production stage
