import { Injectable, inject } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { LoginModel } from '../models/login.model';
import { RegisterModel } from '../models/register.model';
import { Role } from '../../shared/enums/role.enum';
import { AuthApiService } from './auth.api.service';
import { AuthStateService } from './auth.state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authApiService = inject(AuthApiService);
  private readonly authStateService = inject(AuthStateService);

  authState$ = this.authStateService.getState();

  login(dto: LoginModel): Observable<void> {
    return this.authApiService.login(dto).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.access_token);
        this.decodeToken(response.access_token);
      }),
      map(() => void 0),
    );
  }

  register(dto: RegisterModel): Observable<any> {
    return this.authApiService.register(dto);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.authStateService.clear();
  }

  isLoggedIn(): boolean {
    return this.authStateService.getState()().isLoggedIn;
  }

  getUserRoles(): Role[] | null {
    return this.authStateService.getState()().roles;
  }

  initializeAuth(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.decodeToken(token);
    }
  }

  private decodeToken(token: string): void {
    const decodedToken: any = jwtDecode(token);
    const roles = decodedToken.roles || null;
    this.authStateService.setLoggedIn(true);
    this.authStateService.setRoles(roles);
  }
}
