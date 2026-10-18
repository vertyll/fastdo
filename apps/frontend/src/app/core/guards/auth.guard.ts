import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';
import { AuthStateService } from '../../auth/data-access/auth.state.service';
import { KeycloakPages } from '../keycloak';

/** A page that needs a session sends a signed-out reader to sign in, and back to that page after. */
export const authGuard: CanActivateFn = (_route, state) => {
  const keycloakPages = inject(KeycloakPages);
  const authService = inject(AuthService);
  const authStateService = inject(AuthStateService);

  const allow = (loggedIn: boolean): boolean => {
    if (!loggedIn) {
      keycloakPages.signIn(state.url);
    }
    return loggedIn;
  };

  if (authStateService.resolved()) {
    return allow(authStateService.isLoggedIn());
  }

  return authService.loadSession().pipe(map(session => allow(session !== null)));
};
