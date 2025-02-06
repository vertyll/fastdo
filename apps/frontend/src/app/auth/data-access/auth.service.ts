import { Injectable, inject, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/types/api-response.type';
import { LoginResponse, RegisterResponse } from '../../shared/types/auth.type';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { AuthApiService } from './auth.api.service';
import { AuthStateService } from './auth.state.service';

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

  public login(dto: LoginDto): Observable<ApiResponse<LoginResponse>> {
    return this.authApiService.login(dto).pipe(
      tap(response => this.setAccessToken(response.data.accessToken)),
      catchError(error => {
        console.error('Login failed:', error);
        throw error;
      }),
    );
  }

  public register(dto: RegisterDto): Observable<ApiResponse<RegisterResponse>> {
    return this.authApiService.register(dto);
  }

  public logout(): void {
    this.stopRefreshTokenTimer();
    this.authApiService.logout().subscribe({
      next: () => this.clearAuthState(),
      error: err => console.error('Logout failed:', err),
    });
  }

  public forgotPassword(dto: ForgotPasswordDto): Observable<ApiResponse<void>> {
    return this.authApiService.forgotPassword(dto);
  }

  public resetPassword(dto: ResetPasswordDto): Observable<ApiResponse<void>> {
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

  private setAccessToken(token: string): void {
    this.accessToken.set(token);
    this.authStateService.setToken(token);
    this.decodeToken(token);
    this.setupRefreshTokenTimer(token);
  }

  private decodeToken(token: string): void {
    try {
      const decoded: any = jwtDecode(token);
      this.authStateService.setLoggedIn(true);
      this.authStateService.setRoles(decoded.roles || []);
    } catch (error) {
      console.error('Failed to decode token:', error);
      this.clearAuthState();
    }
  }

  public isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return true;

      const bufferTime = environment.refreshToken.bufferTime || 60 * 1000;
      return Date.now() >= (decoded.exp * 1000 - bufferTime);
    } catch {
      return true;
    }
  }

  private setupRefreshTokenTimer(token: string): void {
    this.stopRefreshTokenTimer();

    try {
      const decoded: any = jwtDecode(token);
      const bufferTime = environment.refreshToken.bufferTime || 60 * 1000;
      const expiresInMs = decoded.exp * 1000 - Date.now() - bufferTime;

      if (expiresInMs > 0) {
        this.refreshTokenTimeout = setTimeout(() => {
          this.refreshToken().subscribe();
        }, expiresInMs);
      }
    } catch (error) {
      console.error('Failed to set up refresh token timer:', error);
    }
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = undefined;
    }
  }

  public clearAuthState(): void {
    this.stopRefreshTokenTimer();
    this.accessToken.set(null);
    this.authStateService.clear();
  }
}
