<p align="center">
    <img alt="" src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white">
    <img alt="" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
    <img alt="" src="https://img.shields.io/badge/RxJS-B7178C?style=for-the-badge&logo=reactivex&logoColor=white">
    <img alt="" src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">
    <img alt="" src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white">
</p>

## Project Assumptions

A web application for managing projects and their tasks. The repository holds the front end only — the back end is
[VEDS](https://github.com/vertyll/veds), a Kotlin microservice system, and everything this application needs reaches
it through the VEDS API gateway.

## Link: https://fastdo.vertyll.dev

## Technology Stack

- Angular with standalone components and signals.
- RxJS for the asynchronous edges, NGXS for cross-cutting state.
- Tailwind CSS with a custom theme and dark/light mode.
- `ngx-translate` with an ICU message compiler, English and Polish.
- `@stomp/stompjs` for the notification WebSocket.
- Turborepo for task orchestration and caching, ESLint and Prettier for static analysis.

Components are organized by Atomic Design and the whole interface is translated; reference data arrives already
translated from the back end.

## Documentation

**New here?** Read [Development Setup](./docs/development-setup.md) to get it running, then
[Architecture](./docs/architecture.md) for the shape of the application and
[Authentication](./docs/authentication.md) for why there is no login form.

### Getting it running

- [Development Setup](./docs/development-setup.md) — installing, running against a local VEDS, and building.

### How the application is built

- [Architecture](./docs/architecture.md) — the single address it talks to, how features are laid out, and how permissions decide what renders.
- [Authentication](./docs/authentication.md) — the BFF token handler, and why no token ever reaches JavaScript.

### Working with the back end

- [Calling the VEDS API](./docs/veds-api.md) — the response envelope, error keys, optimistic concurrency and file uploads.
- [Translations](./docs/translations.md) — the two catalogues, the two tracks, ICU plurals, and why a missing key renders as the key.

### Shared components

- [The shared table](./docs/shared-table.md) — the three rules in `TableComponent` that look like defects, and how actions are gated.

> [!NOTE]
>
> During application development, SOLID principles, DRY, composition over inheritance, dependency injection,
> design patterns and architectural patterns were applied.

## Screenshots

![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot1.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot2.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot3.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot4.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot5.png)
