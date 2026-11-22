import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, shareReplay, tap } from 'rxjs/operators';

/**
 * The CSRF token the gateway hands over with `GET /auth/session`, which every write to the gateway sends back. It is
 * kept in memory only: a reload asks for the session again, and with it for the token.
 */
@Injectable({
  providedIn: 'root',
})
export class CsrfTokenStore {
  private token: string | null = null;
  private refreshing: Observable<string | null> | null = null;

  public current(): string | null {
    return this.token;
  }

  public set(token: string): void {
    this.token = token;
  }

  /**
   * Fetches a fresh token with `fetch`, unless a fetch is already under way: every caller that asks meanwhile shares
   * it, so writes refused together ask the gateway once. Emits the token, or `null` when the gateway handed none over.
   */
  public refresh(fetch: () => Observable<string | null>): Observable<string | null> {
    this.refreshing ??= fetch().pipe(
      tap(token => {
        if (token !== null) {
          this.set(token);
        }
      }),
      finalize(() => (this.refreshing = null)),
      shareReplay(1),
    );
    return this.refreshing;
  }
}
