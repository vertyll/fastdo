ARG NODE_IMAGE=node:26-alpine
ARG NGINX_IMAGE=nginx:mainline-alpine

FROM ${NODE_IMAGE} AS build
ARG API_URL
RUN test -n "$API_URL" || (echo "Pass --build-arg API_URL=<the gateway's address>" >&2 && exit 1)
WORKDIR /workspace
RUN npm install --global corepack@0.36.0 && corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend/package.json apps/frontend/
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY apps/frontend/ apps/frontend/
RUN printf "export const environment = {\n  production: true,\n  apiUrl: '%s',\n  defaultLanguage: 'pl',\n  availableLanguages: ['pl', 'en'],\n};\n" \
      "${API_URL}" > apps/frontend/src/environments/environment.prod.ts
RUN pnpm run build:frontend

FROM ${NGINX_IMAGE} AS runtime
ARG API_URL
ARG STORAGE_URL
RUN test -n "$STORAGE_URL" || (echo "Pass --build-arg STORAGE_URL=<the object storage's address>" >&2 && exit 1)
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf
COPY apps/frontend/security-headers.conf /etc/nginx/security-headers.conf
RUN sed -i \
      -e "s|@API_URL@|${API_URL}|g" \
      -e "s|@API_WS_URL@|$(echo "${API_URL}" | sed 's|^http|ws|')|g" \
      -e "s|@STORAGE_URL@|${STORAGE_URL}|g" \
      /etc/nginx/security-headers.conf
COPY --from=build --chown=nginx:nginx /workspace/apps/frontend/dist/frontend/browser /usr/share/nginx/html
RUN mkdir -p /var/cache/nginx /var/run/nginx \
    && chown -R nginx:nginx /var/cache/nginx /var/run/nginx
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
