import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class EmailChangeService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public handleEmailChange(force = false): void {
    if (force) {
      this.authService.logout();
      this.router.navigate(['/login']).then();
    }
  }
}
