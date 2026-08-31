## Project Assumptions

A web application for managing projects and their tasks. The repository holds the front end only — the back end is
[VEDS](https://github.com/vertyll/veds), a Kotlin microservice system, and everything this application needs reaches
it through the VEDS API gateway.

## Link: https://fastdo.vertyll.dev

## Architecture

The front end talks to exactly one address: the VEDS **api-gateway**. Services are never called directly, so the
browser needs no knowledge of how the back end is split up, and the gateway is the only place where authorization,
CORS and session handling live.

| Concern               | Where it is served from                                                    |
|-----------------------|----------------------------------------------------------------------------|
| Sign-in and session   | api-gateway (`/auth/authorize`, `/auth/callback`, `/auth/session`)         |
| Accounts and roles    | iam-service (`/auth/**`, `/users/**`, `/roles/**`)                         |
| Projects              | project-service (`/projects/**`, `/project-types/**`, `/project-roles/**`) |
| Tasks and comments    | task-service (`/tasks/**`)                                                 |
| Notifications         | notification-service (`/notifications/**`, `/ws/notifications`)            |
| Files                 | file-service (`/files/**`)                                                 |
| Translation catalogue | translation-service (`/translations/**`)                                   |

## Technology Stack

### Front-end:

- Angular.
- RxJS.
- NGXS.
- Tailwind CSS.
- `@stomp/stompjs` for the notification WebSocket.

### Authentication

Authentication is **not** implemented here. VEDS uses the BFF token-handler pattern: the gateway runs the Keycloak
authorization-code flow with PKCE and keeps the tokens in its own Redis-backed session, handing the browser nothing
but an `HttpOnly` cookie.

What follows from that, and is worth knowing before changing anything in `src/app/auth`:

- **There is no login form.** Signing in is a redirect to `/auth/authorize`; Keycloak collects the credentials.
- **No token ever reaches JavaScript**, so there is nothing to store, refresh or accidentally log. Requests carry
  `withCredentials: true` and nothing else.
- **Registration and password changes happen on Keycloak's pages**, reached through `/auth/authorize?kc_action=…`.
  The gateway only relays actions it recognizes.
- The signed-in user is whatever `GET /auth/session` returns — `{ userId, email, roles }`.

### Front-end Core:

- State management with NGXS.
- Fully translated into English and Polish. Reference data (project types, statuses, categories, roles) arrives
  already translated: the `x-lang` header decides, and the server resolves it, so the UI never picks a translation.
- Notifications carry a message key and parameters rather than finished text, so an old notification still renders in
  whatever language is selected today.
- Custom Tailwind theme with dark/light mode.
- Components are reusable and organized by Atomic Design.

### Working with the VEDS API

Three conventions are worth knowing before adding a call:

- **Envelope.** Every response is `{ data, message, timestamp }`. `message` is a translation key, not a sentence.
- **Optimistic concurrency.** Anything with a `version` is written back with an `If-Match: W/"<version>"` header;
  the service refuses the write if the record has moved on. `HttpApiService.ifMatch()` builds it.
- **Files are references.** Uploads go straight to object storage on a signed URL and only the file id reaches the
  service that owns the record — see `FileUploadService`.

### Other:

- Turborepo for script automation and monorepo structure management.
- ESLint and Prettier for static code analysis and consistent code quality.

> [!NOTE]
>
> During application development, SOLID principles, DRY, composition over inheritance, dependency injection,
> design patterns, architectural patterns, testing, and other good programming practices were applied.

## Screenshots

![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot1.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot2.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot3.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot4.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot5.png)

## Installation Instructions

1. Download the project to your local environment.
2. Install the dependencies:
    ```bash
    pnpm install
    ```

There is nothing to configure and no `.env` to create: the only setting is the gateway address in
`apps/frontend/src/environments/environment.ts`, which already points at a local VEDS.

### Running against a local VEDS

The back end is not part of this repository. Start it from the VEDS repository first — its `docker-compose.yml`
brings up PostgreSQL, Keycloak, Kafka, Redis and object storage, and the services are run from there:

```bash
docker compose up -d
```

Then start the front end:

```bash
pnpm run dev
```

> [!NOTE]
>
> By default:
> - The VEDS api-gateway is available at [http://localhost:8080](http://localhost:8080).
> - The front-end application is available at [http://localhost:4200](http://localhost:4200).
>
> The gateway only accepts browser requests from origins listed in its `veds.gateway.cors.allowed-origins`;
> `http://localhost:4200` is there by default.

### Building

```bash
pnpm run build
```

The production bundle takes the gateway address from the `API_URL` build argument (see `apps/frontend/Dockerfile`).
No secret is baked in — the browser holds no credential of its own.
