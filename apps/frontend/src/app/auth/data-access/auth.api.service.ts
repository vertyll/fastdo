import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/types/api-response.type';
import { LoginResponse, RegisterResponse } from '../../shared/types/auth.type';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService extends HttpApiService {
  public login(dto: LoginDto): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/login`, dto);
  }

  public register(dto: RegisterDto): Observable<ApiResponse<RegisterResponse>> {
    return this.http.post<ApiResponse<RegisterResponse>>(`${this.baseUrl}/auth/register`, dto);
  }

  public refreshToken(): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/refresh-token`, {});
  }

  public logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/logout`, {});
  }

  public forgotPassword(dto: ForgotPasswordDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/forgot-password`, dto);
  }

  public resetPassword(dto: ResetPasswordDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/reset-password`, dto);
  }
}
