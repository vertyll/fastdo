import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, defaultIfEmpty, filter, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { X_XSRF_TOKEN_HEADER } from '../../app.constants';
import { errorKeyOf } from '../../shared/utils/api-error.utils';
import { CsrfTokenStore } from '../auth/csrf-token.store';

const SAFE_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_TOKEN_INVALID = 'common.csrf_token_invalid';

/**
 * Sends the gateway's CSRF token with every write to it. Angular's own XSRF support reads the token from a cookie and
 * sends it to relative URLs only; the gateway is another origin, whose cookie this page cannot read, so the token
 * comes from the header the gateway answers with instead.
 *
 * A write made before any token arrived asks `GET /auth/session` for one first. A write the gateway refuses for its
 * token is sent once more with a fresh one, which is all a token that went stale needs; a second refusal is the
 * caller's to handle. It sits after `errorInterceptor`, so a refusal the retry fixes is never reported.
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  const csrfTokenStore = inject(CsrfTokenStore);
  const send = (token: string | null): Observable<HttpEvent<unknown>> =>
    next(withToken(req, token)).pipe(tap(event => remember(event, csrfTokenStore)));

  if (SAFE_METHODS.has(req.method)) {
    return send(null);
  }
  const refresh = (): Observable<string | null> => csrfTokenStore.refresh(() => fetchToken(next));
  const token = csrfTokenStore.current();
  if (token === null) {
    return refresh().pipe(switchMap(send));
  }

  return send(token).pipe(
    catchError((error: unknown) => {
      if (!isCsrfRefusal(error)) {
        return throwError(() => error);
      }
      // Another write's refresh may already have brought a token this one was not sent with.
      const newer = csrfTokenStore.current();
      const fresh = newer !== null && newer !== token ? of(newer) : refresh();
      return fresh.pipe(switchMap(retried => (retried === null ? throwError(() => error) : send(retried))));
    }),
  );
};

function withToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token === null ? req : req.clone({ headers: req.headers.set(X_XSRF_TOKEN_HEADER, token) });
}

function remember(event: HttpEvent<unknown>, csrfTokenStore: CsrfTokenStore): void {
  const issued = event instanceof HttpResponse ? event.headers.get(X_XSRF_TOKEN_HEADER) : null;
  if (issued !== null) {
    csrfTokenStore.set(issued);
  }
}

function isCsrfRefusal(error: unknown): boolean {
  return (
    error instanceof HttpErrorResponse &&
    error.status === HttpStatusCode.Forbidden &&
    errorKeyOf(error) === CSRF_TOKEN_INVALID
  );
}

/** Asks the gateway for a token, past the interceptors before this one, so a failure here is not reported twice. */
function fetchToken(next: HttpHandlerFn): Observable<string | null> {
  return next(new HttpRequest('GET', `${environment.apiUrl}/auth/session`, { withCredentials: true })).pipe(
    filter((event): event is HttpResponse<unknown> => event instanceof HttpResponse),
    map(response => response.headers.get(X_XSRF_TOKEN_HEADER)),
    defaultIfEmpty(null),
    catchError(() => of(null)),
  );
}
