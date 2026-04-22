import { Injectable, computed, signal } from '@angular/core';
import { RoleEnum } from '../../shared/enums/role.enum';
import { AuthState } from '../../shared/types/auth.type';
import { ACCESS_TOKEN_KEY } from '../../app.contansts';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly authState = signal<AuthState>({
    isLoggedIn: !!localStorage.getItem(ACCESS_TOKEN_KEY),
    roles: null,
  });

  private readonly token = signal<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));

  public readonly isLoggedIn = computed(() => this.authState().isLoggedIn);
  public readonly roles = computed(() => this.authState().roles);

  public getToken(): string | null {
    return this.token();
  }

  public setToken(token: string | null): void {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
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
