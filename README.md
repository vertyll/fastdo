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

- **Identity provider**: Keycloak (realm `veds`); the application has no login form.
- **Pattern**: BFF; the VEDS API gateway keeps the tokens, the browser holds only a session cookie.
- **State**: no token or session in the front-end; the session lives in the gateway, in Redis.
- **Details**: [Authentication](docs/authentication.md).

### Core front-end:

- Components organized by Atomic Design.
- Light and dark theme.
- Polish and English; reference data arrives already translated from the back-end.
- Permissions decide what renders.
- Optimistic concurrency and RFC 9457 errors from the back-end are handled in one place.
- And many other features that can be found in the application code.

### Other:

- ESLint for static code analysis.
- Prettier for code formatting.

## Documentation

- [Contents](CONTENTS.md) – every document in the repository, the module it belongs to, and what it covers.
- [Glossary](GLOSSARY.md) – every term the docs use, and where it is explained.
- [Standards](STANDARDS.md) – the RFCs and specifications the code implements or depends on.

## Preview Screenshots

![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot1.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot2.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot3.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot4.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot5.png)
