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
  private readonly URL = environment.backendUrl;
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

  forgotPassword(dto: ForgotPasswordDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.URL}/auth/forgot-password`, dto);
  }

  resetPassword(dto: ResetPasswordDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.URL}/auth/reset-password`, dto);
  }
}
