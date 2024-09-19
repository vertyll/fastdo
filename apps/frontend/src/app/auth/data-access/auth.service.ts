import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly URL = environment.backendUrl;
  private readonly http = inject(HttpClient);

  login(dto: LoginDto): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(
      `${this.URL}/auth/login`,
      dto,
    );
  }

  register(dto: RegisterDto): Observable<any> {
    return this.http.post(`${this.URL}/auth/register`, dto);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }
}
