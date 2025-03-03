FROM node:22-alpine AS base

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Install libc6-compat for Alpine
RUN apk add --no-cache libc6-compat

# Development stage
FROM base AS development

# Copy configuration files (package.json, turborepo, etc.)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/
# For shared packages, add:
# COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install

# Copy source code (for development version, we use volumes)
COPY . .

# Run NestJS development server
CMD ["pnpm", "run", "dev:backend"]

# Build stage
FROM base AS build

# Copy configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/
# For shared packages:
# COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build application
RUN pnpm run build:backend

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install libc6-compat for Alpine
RUN apk add --no-cache libc6-compat

# Copy only files needed to run the application
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/apps/backend/package.json ./apps/backend/
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
# Copy shared packages if used:
# COPY --from=build /app/packages/*/dist ./packages/*/dist
# COPY --from=build /app/packages/*/package.json ./packages/*/

# Install production dependencies only
RUN pnpm install --prod

# Run application
CMD ["node", "apps/backend/dist/main.js"]