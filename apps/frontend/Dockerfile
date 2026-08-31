ARG NODE_VERSION=24

# Base stage
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.25.0 --activate
RUN apk add --no-cache libc6-compat

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build

# Build arguments for environment
ARG API_URL=http://localhost:8080
ARG DOMAIN=localhost:4200

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile

COPY apps/frontend ./apps/frontend

# Create production environment file
RUN echo "export const environment = { \
  production: true, \
  apiUrl: '${API_URL}', \
  domain: '${DOMAIN}', \
  defaultLanguage: 'pl', \
  availableLanguages: ['pl', 'en'] \
  };" > apps/frontend/src/environments/environment.prod.ts

# Build the application
RUN pnpm run build:frontend

# Production stage with nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/apps/frontend/dist/frontend/browser /usr/share/nginx/html

# Create nginx cache and runtime directories
RUN mkdir -p /var/cache/nginx/client_temp \
  /var/cache/nginx/proxy_temp \
  /var/cache/nginx/fastcgi_temp \
  /var/cache/nginx/uwsgi_temp \
  /var/cache/nginx/scgi_temp \
  /var/run/nginx \
  && chown -R nginx:nginx /var/cache/nginx /var/run/nginx /usr/share/nginx/html \
  && chmod -R 755 /var/cache/nginx /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
