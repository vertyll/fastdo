import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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
  private readonly translateService = inject(TranslateService);

  public readonly session = this.authStateService.session;
  public readonly isLoggedIn = this.authStateService.isLoggedIn;
  public readonly userRoles = this.authStateService.roles;
  public readonly resolved = this.authStateService.resolved;

  public login(): void {
    this.authorize({});
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

  /** Sends the browser to Keycloak's sign-in, in FastDo's theme and language, with the parameters given. */
  public authorize(parameters: Record<string, string>): void {
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
