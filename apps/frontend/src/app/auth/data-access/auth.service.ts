import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Session } from '../defs/auth.defs';
import { AuthApiService } from './auth.api.service';
import { AuthStateService } from './auth.state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authApiService = inject(AuthApiService);
  private readonly authStateService = inject(AuthStateService);

  public readonly session = this.authStateService.session;
  public readonly isLoggedIn = this.authStateService.isLoggedIn;
  public readonly userRoles = this.authStateService.roles;
  public readonly resolved = this.authStateService.resolved;

  public loadSession(): Observable<Session | null> {
    return this.authApiService.session().pipe(
      tap(session => this.authStateService.setSession(session)),
      catchError(() => {
        this.authStateService.clear();
        return of(null);
      }),
    );
  }

  public logout(): Observable<void> {
    return this.authApiService.logout().pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
      tap(() => this.authStateService.clear()),
    );
  }

  public getCurrentUserEmail(): string | null {
    return this.authStateService.email();
  }
}
