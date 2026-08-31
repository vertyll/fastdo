import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';
import { AuthStateService } from '../../auth/data-access/auth.state.service';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const authStateService = inject(AuthStateService);

  const allow = (loggedIn: boolean): boolean | UrlTree => !loggedIn || router.createUrlTree(['/dashboard']);

  if (authStateService.resolved()) {
    return allow(authStateService.isLoggedIn());
  }

  return authService.loadSession().pipe(map(session => allow(session !== null)));
};
