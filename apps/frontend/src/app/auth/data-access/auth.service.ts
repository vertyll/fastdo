import { Injectable, inject } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AuthApiService } from './auth.api.service';
import { AuthStateService } from './auth.state.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authApiService = inject(AuthApiService);
  private readonly authStateService = inject(AuthStateService);

  isLoggedIn = this.authStateService.isLoggedIn;
  userRoles = this.authStateService.roles;

  login(dto: LoginDto): Observable<void> {
    return this.authApiService.login(dto).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.access_token);
        this.decodeToken(response.access_token);
      }),
      map(() => void 0),
    );
  }

  register(dto: RegisterDto): Observable<any> {
    return this.authApiService.register(dto);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.authStateService.clear();
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
