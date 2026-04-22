import { Injectable, inject, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleEnum } from '../../shared/enums/role.enum';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
} from '../defs/auth.defs';
import { AuthApiService } from './auth.api.service';
import { AuthStateService } from './auth.state.service';
import { DEFAULT_BUFFER_TIME } from '../../app.contansts';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authApiService = inject(AuthApiService);
  private readonly authStateService = inject(AuthStateService);
  private refreshTokenTimeout?: ReturnType<typeof setTimeout>;

  public readonly isLoggedIn = this.authStateService.isLoggedIn;
  public readonly userRoles = this.authStateService.roles;

  private readonly accessToken = signal<string | null>(this.authStateService.getToken());

  public login(dto: LoginPayload): Observable<ApiResponse<LoginResponse>> {
    return this.authApiService.login(dto).pipe(
      tap(response => this.setAccessToken(response.data.accessToken)),
      catchError(error => {
        console.error('Login failed:', error);
        throw error;
      }),
    );
  }

  public register(dto: RegisterPayload): Observable<ApiResponse<RegisterResponse>> {
    return this.authApiService.register(dto);
  }

  public logout(): void {
    this.stopRefreshTokenTimer();
    this.authApiService.logout().subscribe({
      next: () => this.clearAuthState(),
      error: err => console.error('Logout failed:', err),
    });
  }

  public forgotPassword(dto: ForgotPasswordPayload): Observable<ApiResponse<void>> {
    return this.authApiService.forgotPassword(dto);
  }

  public resetPassword(dto: ResetPasswordPayload): Observable<ApiResponse<void>> {
    return this.authApiService.resetPassword(dto);
  }

  public getAccessToken(): string | null {
    return this.accessToken();
  }

  public isTokenValid(): boolean {
    return !!this.accessToken() && !this.isTokenExpired(this.accessToken()!);
  }

  public refreshToken(): Observable<ApiResponse<LoginResponse>> {
    return this.authApiService.refreshToken().pipe(
      tap(response => this.setAccessToken(response.data.accessToken)),
      catchError(error => {
        console.error('Token refresh failed:', error);
        this.clearAuthState();
        throw error;
      }),
    );
  }

  public initializeAuth(): void {
    const token = this.authStateService.getToken();
    if (!token) return;

    if (this.isTokenExpired(token)) {
      this.refreshToken().subscribe({
        error: () => this.clearAuthState(),
      });
    } else {
      this.setAccessToken(token);
    }
  }

  public getCurrentUserEmail(): string | null {
    const token = this.authStateService.getToken();
    if (!token) {
      return null;
    }

    const decoded = this.tryDecodeToken<{ email?: string }>(token);
    return decoded?.email || null;
  }

  public clearAuthState(): void {
    this.stopRefreshTokenTimer();
    this.accessToken.set(null);
    this.authStateService.clear();
  }

  public isTokenExpired(token: string): boolean {
    const decoded = this.tryDecodeToken<{ exp?: number }>(token);
    if (!decoded?.exp) return true;

    const bufferTime = environment.refreshToken.bufferTime || DEFAULT_BUFFER_TIME;
    return Date.now() >= decoded.exp * 1000 - bufferTime;
  }

  private setAccessToken(token: string): void {
    this.accessToken.set(token);
    this.authStateService.setToken(token);
    this.decodeToken(token);
    this.setupRefreshTokenTimer(token);
  }

  private decodeToken(token: string): void {
    const decoded = this.tryDecodeToken<{ roles?: RoleEnum[] }>(token);
    if (!decoded) {
      this.clearAuthState();
      return;
    }

    this.authStateService.setLoggedIn(true);
    this.authStateService.setRoles(decoded.roles || []);
  }

  private setupRefreshTokenTimer(token: string): void {
    this.stopRefreshTokenTimer();

    const decoded = this.tryDecodeToken<{ exp?: number }>(token);
    if (!decoded?.exp) return;

    const bufferTime = environment.refreshToken.bufferTime || DEFAULT_BUFFER_TIME;
    const expiresInMs = decoded.exp * 1000 - Date.now() - bufferTime;

    if (expiresInMs > 0) {
      this.refreshTokenTimeout = setTimeout(() => {
        this.refreshToken().subscribe();
      }, expiresInMs);
    }
  }

  private tryDecodeToken<T>(token: string): T | null {
    try {
      return jwtDecode<T>(token);
    } catch {
      return null;
    }
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = undefined;
    }
  }
}
