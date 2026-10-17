import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ThemeService } from 'src/app/shared/services/theme.service';
import { Session } from '../defs/auth.defs';
import { AuthApiService } from './auth.api.service';
import { AuthStateService } from './auth.state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authApiService = inject(AuthApiService);
  private readonly authStateService = inject(AuthStateService);
  private readonly themeService = inject(ThemeService);

  public readonly session = this.authStateService.session;
  public readonly isLoggedIn = this.authStateService.isLoggedIn;
  public readonly userRoles = this.authStateService.roles;
  public readonly resolved = this.authStateService.resolved;

  public login(): void {
    this.authorize({});
  }

  public startAccountAction(action: 'UPDATE_PASSWORD' | 'CONFIGURE_TOTP' | 'delete_credential'): void {
    this.authorize({ kc_action: action });
  }

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

  private authorize(parameters: Record<string, string>): void {
    const query = new URLSearchParams({ ...parameters, theme: this.themeService.currentTheme });
    window.location.href = `${environment.apiUrl}/auth/authorize?${query}`;
  }
}
