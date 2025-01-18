import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../shared/types/api-response.type';
import { LoginResponse, RegisterResponse } from '../../shared/types/auth.type';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';

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
}
