import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
} from '../defs/auth.defs';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService extends HttpApiService {
  public login(dto: LoginPayload): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/login`, dto);
  }

  public register(dto: RegisterPayload): Observable<ApiResponse<RegisterResponse>> {
    return this.http.post<ApiResponse<RegisterResponse>>(`${this.baseUrl}/auth/register`, dto);
  }

  public refreshToken(): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/refresh-token`, {});
  }

  public logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/logout`, {});
  }

  public forgotPassword(dto: ForgotPasswordPayload): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/forgot-password`, dto);
  }

  public resetPassword(dto: ResetPasswordPayload): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/reset-password`, dto);
  }
}
