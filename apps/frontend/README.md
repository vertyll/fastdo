# FastDo front-end

## Project Assumptions

The FastDo Angular application. See the [repository README](../../README.md) for the overview.

## Commands

- `npm run dev` – development server at `http://localhost:4200`.
- `npm run build` – production build in `dist/`.
- `npm run test` – unit tests with Vitest.
- `npm run lint` – ESLint.

## Keycloak

What FastDo shares with Keycloak's pages, the theme and the language, lives in `src/app/core/keycloak`; the rest of
the application imports only its `index.ts`, and ESLint refuses a deeper import.
