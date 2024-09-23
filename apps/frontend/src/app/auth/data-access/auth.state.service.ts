import { Injectable, signal } from '@angular/core';
import { Role } from '../../shared/enums/role.enum';

export interface AuthState {
  isLoggedIn: boolean;
  roles: Role[] | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private authState = signal<AuthState>({
    isLoggedIn: false,
    roles: null,
  });

  getState() {
    return this.authState.asReadonly();
  }

  setLoggedIn(isLoggedIn: boolean) {
    this.authState.update((state) => ({ ...state, isLoggedIn }));
  }

  setRoles(roles: Role[] | null) {
    this.authState.update((state) => ({ ...state, roles }));
  }

  clear() {
    this.authState.set({
      isLoggedIn: false,
      roles: null,
    });
  }
}
