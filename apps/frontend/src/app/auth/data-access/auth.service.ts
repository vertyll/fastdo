import { Injectable, inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable, map, tap } from 'rxjs';
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

  public readonly isLoggedIn = this.authStateService.isLoggedIn;
  public readonly userRoles = this.authStateService.roles;

  public login(dto: LoginDto): Observable<void> {
    return this.authApiService.login(dto).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.data.accessToken);
        this.decodeToken(response.data.accessToken);
      }),
      map(() => void 0),
    );
  }

  public register(dto: RegisterDto): Observable<ApiResponse<RegisterResponse>> {
    return this.authApiService.register(dto);
  }

  public logout(): void {
    localStorage.removeItem('access_token');
    this.authStateService.clear();
  }

  public initializeAuth(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.decodeToken(token);
    }
  }

  forgotPassword(dto: ForgotPasswordDto): Observable<ApiResponse<void>> {
    return this.authApiService.forgotPassword(dto);
  }

  resetPassword(dto: ResetPasswordDto): Observable<ApiResponse<void>> {
    return this.authApiService.resetPassword(dto);
  }

  private decodeToken(token: string): void {
    const decodedToken: any = jwtDecode(token);
    const roles = decodedToken.roles || null;
    this.authStateService.setLoggedIn(true);
    this.authStateService.setRoles(roles);
  }
}
