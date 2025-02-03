import { Injectable, computed, signal } from '@angular/core';
import { RoleEnum } from '../../shared/enums/role.enum';
import { AuthState } from '../../shared/types/auth.type';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly authState = signal<AuthState>({
    isLoggedIn: false,
    roles: null,
  });

  public readonly isLoggedIn = computed(() => this.authState().isLoggedIn);
  public readonly roles = computed(() => this.authState().roles);

  public setLoggedIn(isLoggedIn: boolean) {
    this.authState.update(state => ({ ...state, isLoggedIn }));
  }

  public setRoles(roles: RoleEnum[] | null) {
    this.authState.update(state => ({ ...state, roles }));
  }

  public clear() {
    this.authState.set({
      isLoggedIn: false,
      roles: null,
    });
  }
}
