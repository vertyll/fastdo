# Authentication

Authentication is **not** implemented here. VEDS uses the BFF token-handler pattern: the gateway runs the Keycloak
authorization-code flow with PKCE and keeps the tokens in its own Redis-backed session, handing the browser nothing
but an `HttpOnly` cookie.

What follows from that, and is worth knowing before changing anything in `src/app/auth`:

- **There is no login form.** Signing in is a redirect to `/auth/authorize`; Keycloak collects the credentials. It
  always carries `return_to`, the page the reader is on, so they come back to it: from the sign-in button, from a page
  that needs a session (`authGuard`), and from a call whose session has ended (`errorInterceptor`).
- **No access token ever reaches JavaScript**, so there is nothing to store, refresh or accidentally log. Requests
  carry `withCredentials: true`, and writes the CSRF token too.
- **Every write carries the gateway's CSRF token** in `X-XSRF-TOKEN`, or the gateway refuses it with `403`. The gateway
  hands the token over in the same header of `GET /auth/session`; `csrfInterceptor` keeps the latest one in memory and
  adds it to every `POST`, `PUT`, `PATCH` and `DELETE` to `environment.apiUrl`, and to nothing else. A write made
  before any token arrived, because that first call failed, asks `GET /auth/session` for one first. A write the gateway
  refuses with `common.csrf_token_invalid`, a token gone stale, is sent once more with a fresh one; writes refused
  together share one fetch, and a second refusal reaches `errorInterceptor` like any other error. The interceptor sits
  after `errorInterceptor`, so a refusal the retry fixes is never shown. Angular's own
  XSRF support does not fit: it reads the token from a cookie and sends it to relative URLs only, while the gateway is
  another origin, whose cookies this page cannot read.
- **Registration and password changes happen on Keycloak's pages**, reached through `/auth/authorize?kc_action=…`.
  The gateway only relays actions it recognizes.
- The signed-in user is whatever `GET /auth/session` returns — `{ userId, email, roles }`.

## Losing the session is a gateway concern

Access tokens are short-lived and the gateway refreshes them behind the cookie. The refresh token is single-use and
Keycloak revokes the whole session if a spent one is replayed, so the gateway runs one refresh per refresh token,
across its replicas too.

Nothing in the front end participates in that, and nothing should try to: a 401 means the session is gone, and the
only correct response is to clear local auth state and let the user sign in again. Retrying the request, or refreshing
anything from here, cannot help.
