import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly router = inject(Router);

  public canActivate(): boolean {
    const token = localStorage.getItem('access_token');
    if (token) {
      return true;
    }
    this.router.navigate(['/login']).then();
    return false;
  }
}
