ARG NODE_IMAGE=node:24-alpine
ARG NGINX_IMAGE=nginx:1.31-alpine

FROM ${NODE_IMAGE} AS build
ARG API_URL=http://localhost:8080
ARG DOMAIN=localhost:4200
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend/package.json apps/frontend/
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY apps/frontend/ apps/frontend/
RUN printf "export const environment = {\n  production: true,\n  apiUrl: '%s',\n  domain: '%s',\n  defaultLanguage: 'pl',\n  availableLanguages: ['pl', 'en'],\n};\n" \
      "${API_URL}" "${DOMAIN}" > apps/frontend/src/environments/environment.prod.ts
RUN pnpm run build:frontend

FROM ${NGINX_IMAGE} AS runtime
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx:nginx /workspace/apps/frontend/dist/frontend/browser /usr/share/nginx/html
RUN mkdir -p /var/cache/nginx /var/run/nginx \
    && chown -R nginx:nginx /var/cache/nginx /var/run/nginx
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
