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

The image takes two build arguments, both required (see `apps/frontend/Dockerfile`): `API_URL`, the gateway's address,
which the production bundle calls, and `STORAGE_URL`, the object storage that serves files through presigned
addresses. Both go into the `Content-Security-Policy` nginx sends with every response
(`apps/frontend/security-headers.conf`).
No secret is baked in — the browser holds no credential of its own.

The policy has no `'unsafe-eval'`, `'unsafe-inline'` or `'unsafe-hashes'`. The `<style>` elements Angular and its
components insert at run time are allowed by a nonce: `src/index.html` carries `ngCspNonce="CSP_NONCE"` on
`<app-root>`, and nginx replaces the placeholder in every response for `index.html` with `$request_id`, 16 random
bytes new for every request, which the `style-src` directive of the same response names. `index.html` is sent with
`Cache-Control: no-store`, since a cached copy would carry a nonce no later policy allows. A `style="…"` attribute
in a template is refused by this policy, so a template styles through classes or `[style.x]` bindings, which Angular
applies through the DOM; for the same reason ng-icons is configured with `withContentSecurityPolicy()`
(`src/app/app.config.ts`), which moves the `style` attribute of each SVG icon onto the element through the DOM.

## Tasks and caching

Turborepo orchestrates the scripts and caches their results; a repeated build with nothing changed is served from
cache rather than rerun.

```bash
pnpm run lint
pnpm run format
pnpm run build
```

## Documentation checks

The Markdown is formatted and linted with [markright](https://github.com/vertyll/markright), at the version the
[Docs workflow](../.github/workflows/docs.yml) pins. Install that version, from an archive of its
[release](https://github.com/vertyll/markright/releases) or with `cargo install --locked markright@VERSION`, then run:

```bash
markright fmt
markright check
```

`fmt` rewrites what it can; `check` reports the rest and fails on any issue, as the workflow does on every push and
pull request, and `check --fix` does both in one run. [`.markright.toml`](../.markright.toml) chooses the formatters
and linters and what each one skips.
