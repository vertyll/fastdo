import { Injectable, computed, signal } from '@angular/core';
import { RoleEnum } from '../../shared/enums/role.enum';
import { AuthState, Session } from '../defs/auth.defs';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly state = signal<AuthState>({ session: null, resolved: false });

  public readonly session = computed(() => this.state().session);
  public readonly isLoggedIn = computed(() => this.state().session !== null);
  public readonly roles = computed<RoleEnum[]>(() => this.state().session?.roles ?? []);
  public readonly email = computed(() => this.state().session?.email ?? null);
  public readonly userId = computed(() => this.state().session?.userId ?? null);

  public readonly resolved = computed(() => this.state().resolved);

  public setSession(session: Session | null): void {
    this.state.set({ session, resolved: true });
  }

  public clear(): void {
    this.setSession(null);
  }
}
