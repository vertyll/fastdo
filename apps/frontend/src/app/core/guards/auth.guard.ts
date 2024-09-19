import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');
    if (token) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
