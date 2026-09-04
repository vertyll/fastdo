import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleEnum } from '../../shared/enums/role.enum';
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

  public login(): void {
    window.location.href = `${environment.apiUrl}/auth/authorize`;
  }

  public startAccountAction(action: 'UPDATE_PASSWORD' | 'CONFIGURE_TOTP' | 'delete_credential'): void {
    window.location.href = `${environment.apiUrl}/auth/authorize?kc_action=${action}`;
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

  public hasRole(role: RoleEnum): boolean {
    return this.userRoles().includes(role);
  }

  public getCurrentUserEmail(): string | null {
    return this.authStateService.email();
  }

  public getCurrentUserId(): string | null {
    return this.authStateService.userId();
  }

  public clearAuthState(): void {
    this.authStateService.clear();
  }
}
