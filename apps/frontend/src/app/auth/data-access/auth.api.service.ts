import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../shared/types/api-response.type';
import { LoginResponse, RegisterResponse } from '../../shared/types/auth.type';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly URL = environment.backendUrl + '/api';
  private readonly http = inject(HttpClient);

  public login(dto: LoginDto): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.URL}/auth/login`,
      dto,
    );
  }

  public register(dto: RegisterDto): Observable<ApiResponse<RegisterResponse>> {
    return this.http.post<ApiResponse<RegisterResponse>>(
      `${this.URL}/auth/register`,
      dto,
    );
  }

  public refreshToken(): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.URL}/auth/refresh-token`, {});
  }

  public logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.URL}/auth/logout`, {});
  }

  public forgotPassword(dto: ForgotPasswordDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.URL}/auth/forgot-password`, dto);
  }

  public resetPassword(dto: ResetPasswordDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.URL}/auth/reset-password`, dto);
  }
}
