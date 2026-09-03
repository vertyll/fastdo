import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';
import { AuthStateService } from '../../auth/data-access/auth.state.service';
import { RoleEnum } from '../../shared/enums/role.enum';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const authStateService = inject(AuthStateService);

  const allow = (roles: RoleEnum[]): boolean | UrlTree =>
    roles.includes(RoleEnum.Admin) || router.createUrlTree(['/dashboard']);

  if (authStateService.resolved()) {
    return allow(authStateService.roles());
  }

  return authService.loadSession().pipe(map(() => allow(authStateService.roles())));
};
