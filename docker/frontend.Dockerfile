ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Install libc6-compat for Alpine
RUN apk add --no-cache libc6-compat

# Development stage
FROM base AS development

# Copy configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/
# For shared packages:
# COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install

# Copy source code (for development version, we use volumes)
COPY . .

# Run Angular development server
CMD ["pnpm", "run", "dev:frontend"]

# Build stage
FROM base AS build

# Copy configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/
# For shared packages:
# COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build application
RUN pnpm run build:frontend

# Production stage - using nginx to serve static files
FROM nginx:alpine AS production

# Copy built frontend from build stage
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]