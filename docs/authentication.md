# Authentication

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

## Losing the session is a gateway concern

Access tokens are short-lived and the gateway refreshes them behind the cookie. The refresh token is single-use and
Keycloak revokes the whole session if a spent one is replayed, so the gateway serializes refreshes per session.

Nothing in the front end participates in that, and nothing should try to: a 401 means the session is gone, and the
only correct response is to clear local auth state and let the user sign in again. Retrying the request, or refreshing
anything from here, cannot help.
