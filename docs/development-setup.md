# Development Setup

## Install

```bash
pnpm install
```

There is nothing to configure and no `.env` to create. The only setting is the gateway address in
`apps/frontend/src/environments/environment.ts`, which already points at a local VEDS.

## Run against a local VEDS

The back end is not part of this repository. Start it from the VEDS repository first — its `docker-compose.yml` brings
up PostgreSQL, Keycloak, Kafka, Redis and object storage, and the services are run from there:

```bash
docker compose up -d
```

Then start the front end:

```bash
pnpm run dev
```

| Component      | Address                 |
|----------------|-------------------------|
| VEDS gateway   | `http://localhost:8080` |
| This front end | `http://localhost:4200` |

The gateway only accepts browser requests from origins listed in its `veds.gateway.cors.allowed-origins`;
`http://localhost:4200` is there by default.

## Build

```bash
pnpm run build
```

The production bundle takes the gateway address from the `API_URL` build argument (see `apps/frontend/Dockerfile`).
No secret is baked in — the browser holds no credential of its own.

## Tasks and caching

Turborepo orchestrates the scripts and caches their results; a repeated build with nothing changed is served from
cache rather than rerun.

```bash
pnpm run lint
pnpm run format
pnpm run build
```
