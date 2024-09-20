import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginModel } from '../models/login.model';
import { RegisterModel } from '../models/register.model';
import { jwtDecode } from 'jwt-decode';
import { Role } from '../../shared/enums/role.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly URL = environment.backendUrl;
  private readonly http = inject(HttpClient);
  private roles: Role[] | null = null;

  login(dto: LoginModel): Observable<{ access_token: string }> {
    return this.http
      .post<{ access_token: string }>(`${this.URL}/auth/login`, dto)
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.access_token);
          this.decodeToken(response.access_token);
        }),
      );
  }

  register(dto: RegisterModel): Observable<any> {
    return this.http.post(`${this.URL}/auth/register`, dto);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.roles = null;
  }

  private decodeToken(token: string): void {
    const decodedToken: any = jwtDecode(token);
    this.roles = decodedToken.roles || null;
  }

  getUserRoles(): Role[] | null {
    this.decodeToken(localStorage.getItem('access_token') || '');
    return this.roles;
  }
}
