import { Injectable, inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable, map, tap, throwError } from 'rxjs';
import { ApiResponse } from '../../shared/types/api-response.type';
import { RegisterResponse } from '../../shared/types/auth.type';
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

  public login(dto: LoginDto): Observable<void> {
    return this.authApiService.login(dto).pipe(
      tap(response => {
        this.saveTokens(response.data.accessToken, response.data.refreshToken);
        this.decodeToken(response.data.accessToken);
        this.setupRefreshTokenTimer(response.data.accessToken);
      }),
      map(() => void 0),
    );
  }

  public register(dto: RegisterDto): Observable<ApiResponse<RegisterResponse>> {
    return this.authApiService.register(dto);
  }

  public logout(): void {
    this.stopRefreshTokenTimer();
    this.authApiService.logout().subscribe(() => {
      this.clearTokens();
      this.authStateService.clear();
    });
  }

  public initializeAuth(): void {
    const accessToken: string | null = localStorage.getItem('access_token');
    if (accessToken) {
      try {
        if (this.isTokenExpired(accessToken)) {
          this.refreshToken().subscribe({
            error: () => {
              this.clearTokens();
              this.authStateService.clear();
            },
          });
        } else {
          this.decodeToken(accessToken);
          this.setupRefreshTokenTimer(accessToken);
        }
      } catch {
        this.clearTokens();
        this.authStateService.clear();
      }
    }
  }

  public refreshToken(): Observable<string> {
    this.stopRefreshTokenTimer();
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token found'));
    }

    return this.authApiService.refreshToken(refreshToken).pipe(
      map(response => {
        const newAccessToken = response.data.accessToken;
        localStorage.setItem('access_token', newAccessToken);
        this.decodeToken(newAccessToken);
        this.setupRefreshTokenTimer(newAccessToken);
        return newAccessToken;
      }),
    );
  }

  public forgotPassword(dto: ForgotPasswordDto): Observable<ApiResponse<void>> {
    return this.authApiService.forgotPassword(dto);
  }

  public resetPassword(dto: ResetPasswordDto): Observable<ApiResponse<void>> {
    return this.authApiService.resetPassword(dto);
  }

  public isTokenValid(): boolean {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return false;

    try {
      return !this.isTokenExpired(accessToken);
    } catch {
      return false;
    }
  }

  public clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decodedToken: any = jwtDecode(token);
      if (!decodedToken.exp) return true;

      const bufferTime = 10 * 1000;
      const expirationTime = decodedToken.exp * 1000;
      return Date.now() >= (expirationTime - bufferTime);
    } catch {
      return true;
    }
  }

  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private decodeToken(token: string): void {
    const decodedToken: any = jwtDecode(token);
    const roles = decodedToken.roles || null;
    this.authStateService.setLoggedIn(true);
    this.authStateService.setRoles(roles);
  }

  private setupRefreshTokenTimer(token: string): void {
    const decodedToken: any = jwtDecode(token);
    const expires = new Date(decodedToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);

    this.refreshTokenTimeout = setTimeout(() => {
      if (!this.isTokenExpired(token)) {
        this.refreshToken().subscribe();
      }
    }, Math.max(0, timeout));
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }
}
