import { EffectRef, Injectable, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthStateService } from './auth.state.service';

@Injectable({ providedIn: 'root' })
export class AutoLogoutService {
  private watcherRef: EffectRef | null = null;

  constructor(
    private authService: AuthService,
    private authStateService: AuthStateService,
    private router: Router,
  ) {
    this.watcherRef = effect(() => {
      const token = this.authService.getAccessToken();
      const isLoggedIn = this.authStateService.isLoggedIn();

      if (isLoggedIn && (!token || this.authService.isTokenExpired(token))) {
        this.authService.clearAuthState();
        this.router.navigate(['/login']).then();
      }
    });
  }

  public stopWatching(): void {
    this.watcherRef?.destroy();
  }
}
