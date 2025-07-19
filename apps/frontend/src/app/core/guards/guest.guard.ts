import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public canActivate(): boolean {
    if (this.authService.isTokenValid()) {
      this.router.navigate(['/dashboard']).then();
      return false;
    }
    return true;
  }
}
