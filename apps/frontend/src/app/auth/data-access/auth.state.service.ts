import { Injectable, signal, computed } from '@angular/core';
import { Role } from '../../shared/enums/role.enum';

export interface AuthState {
  isLoggedIn: boolean;
  roles: Role[] | null;
}

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
    this.authState.update((state) => ({ ...state, isLoggedIn }));
  }

  public setRoles(roles: Role[] | null) {
    this.authState.update((state) => ({ ...state, roles }));
  }

  public clear() {
    this.authState.set({
      isLoggedIn: false,
      roles: null,
    });
  }
}