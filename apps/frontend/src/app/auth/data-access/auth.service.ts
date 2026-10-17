import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ThemeService } from 'src/app/shared/services/theme.service';
import { KeycloakPreferences } from '../../core/keycloak';
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
  private readonly translateService = inject(TranslateService);
  private readonly keycloak = inject(KeycloakPreferences);

  public readonly session = this.authStateService.session;
  public readonly isLoggedIn = this.authStateService.isLoggedIn;
  public readonly userRoles = this.authStateService.roles;
  public readonly resolved = this.authStateService.resolved;

  public login(): void {
    this.authorize({});
  }

  /**
   * Sends the reader to one Keycloak page, which returns here when done: changing the password, setting up the second
   * factor, or removing a credential named by its id, which Keycloak asks to confirm.
   */
  public startAccountAction(action: 'UPDATE_PASSWORD' | 'CONFIGURE_TOTP' | `delete_credential:${string}`): void {
    // Keycloak shows a signed-in person their account's language, so FastDo's is stored there first.
    this.keycloak.keepAccountLanguage(this.language()).subscribe(() => this.authorize({ kc_action: action }));
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
    const query = new URLSearchParams({
      ...parameters,
      theme: this.themeService.currentTheme,
      ui_locales: this.language(),
    });
    window.location.href = `${environment.apiUrl}/auth/authorize?${query}`;
  }

  private language(): string {
    return this.translateService.getCurrentLang() || environment.defaultLanguage;
  }
}
