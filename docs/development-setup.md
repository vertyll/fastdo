# Development Setup

## Install

```bash
pnpm install
```

There is nothing to configure and no `.env` to create. The only setting is the gateway address in
`apps/frontend/src/environments/environment.ts`, which already points at a local VEDS.

## Run against a local VEDS

The back end is not part of this repository. Start it from the VEDS repository first — its `docker-compose.local.yml`
brings up PostgreSQL, Keycloak, Kafka, Redis and object storage, and the services are run from there:

```bash
docker compose -f docker-compose.local.yml up -d
```

Then start the front end:

```bash
pnpm run dev
```

| Component      | Address                 |
|----------------|-------------------------|
| VEDS gateway   | `http://localhost:8080` |
| This front end | `http://localhost:4200` |

The gateway only accepts browser requests from origins listed in its `application.gateway.cors.allowed-origins`;
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

## Documentation checks

The Markdown is formatted and linted with [mdtools](https://github.com/vertyll/mdtools), at the version the
[Docs workflow](../.github/workflows/docs.yml) pins:

```bash
go run github.com/vertyll/mdtools/cmd/mdtools@VERSION fmt
go run github.com/vertyll/mdtools/cmd/mdtools@VERSION run
```

`fmt` rewrites what it can; `run` reports the rest and fails on any issue, as the workflow does on every push and pull
request. [`.mdtools.yaml`](../.mdtools.yaml) chooses the formatters and linters and what each one skips.
