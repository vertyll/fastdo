<p align="center">
    <img alt="" src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white">
    <img alt="" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
    <img alt="" src="https://img.shields.io/badge/RxJS-B7178C?style=for-the-badge&logo=reactivex&logoColor=white">
    <img alt="" src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">
    <img alt="" src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white">
</p>

## Project Assumptions

Web application for managing projects and their tasks. The repository holds the front-end only; the back-end is
[VEDS](https://github.com/vertyll/veds), reached through its API gateway.

## Link: https://fastdo.vertyll.dev

## Technology Stack

### Front-end:

- Angular (standalone components and signals).
- TypeScript.
- RxJS.
- NGXS.
- Angular Material.
- Tailwind CSS.
- ngx-translate with ICU MessageFormat.
- STOMP over WebSocket for notifications.
- Vitest.
- Turborepo.

### Authentication:

- **Identity provider**: Keycloak (realm `veds`) owns every page that touches a credential: sign-up, sign-in, email
  verification, password reset, two-factor authentication and acceptance of the terms of use.
- **Pattern**: BFF. The VEDS API gateway signs users in and keeps the tokens on the server; the browser holds only an
  `HttpOnly` session cookie, so no token ever reaches JavaScript and the application has no login form.
- **JWT**: the gateway attaches the access token when it forwards a request to a VEDS service; the front-end never sees
  it.

### Core front-end:

- Components organized by Atomic Design.
- Light and dark theme.
- Polish and English; reference data arrives already translated from the back-end.
- Permissions decide what renders.
- Optimistic concurrency and RFC 9457 errors from the API are handled in one place.
- And many other features that can be found in the application code.

### Other:

- ESLint for static code analysis.
- Prettier for code formatting.

## Documentation

- [Development Setup](./docs/development-setup.md) – installing, running against a local VEDS, and building.
- [Architecture](./docs/architecture.md) – how features are laid out and how permissions decide what renders.
- [Authentication](./docs/authentication.md) – the BFF token handler.
- [Calling the VEDS API](./docs/veds-api.md) – errors, optimistic concurrency and file uploads.
- [Translations](./docs/translations.md) – the two catalogues and ICU plurals.
- [The shared table](./docs/shared-table.md) – the rules in `TableComponent` and how actions are gated.

## Preview Screenshots

![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot1.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot2.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot3.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot4.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot5.png)
