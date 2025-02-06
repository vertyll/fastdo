import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public canActivate(): boolean {
    if (!this.authService.isTokenValid()) {
      this.router.navigate(['/login']).then();
      return false;
    }
    return true;
  }
}
