import { Injectable, computed, signal } from '@angular/core';
import { RoleEnum } from '../../shared/enums/role.enum';
import { AuthState } from '../../shared/types/auth.type';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly authState = signal<AuthState>({
    isLoggedIn: !!localStorage.getItem('access_token'),
    roles: null,
  });

  private readonly token = signal<string | null>(localStorage.getItem('access_token'));

  public readonly isLoggedIn = computed(() => this.authState().isLoggedIn);
  public readonly roles = computed(() => this.authState().roles);

  public getToken(): string | null {
    return this.token();
  }

  public setToken(token: string | null): void {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
    this.token.set(token);
  }

  public setLoggedIn(isLoggedIn: boolean): void {
    this.authState.update(state => ({ ...state, isLoggedIn }));
  }

  public setRoles(roles: RoleEnum[] | null): void {
    this.authState.update(state => ({ ...state, roles }));
  }

  public clear(): void {
    this.setToken(null);
    this.authState.set({
      isLoggedIn: false,
      roles: null,
    });
  }
}
