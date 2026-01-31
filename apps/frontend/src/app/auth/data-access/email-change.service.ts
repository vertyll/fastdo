import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class EmailChangeService {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  public handleEmailChange(force = false): void {
    if (force) {
      this.authService.logout();
      this.router.navigate(['/login']).then();
    }
  }
}
