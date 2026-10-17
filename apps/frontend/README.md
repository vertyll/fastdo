# FastDo front-end

## Project Assumptions

The FastDo Angular application. See the [repository README](../../README.md) for the overview.

## Commands

- `npm run dev` – development server at `http://localhost:4200`.
- `npm run build` – production build in `dist/`.
- `npm run test` – unit tests with Vitest.
- `npm run lint` – ESLint.

## Keycloak

Keycloak's pages live in `src/app/core/keycloak`: the sign-in in FastDo's theme and language, the account actions
(password, second factor), and the theme and language shared with those pages both ways. The rest of the application
imports only its `index.ts`, and ESLint refuses a deeper import. It watches the theme and the language the reader chooses, so
nothing in `shared` knows it.
