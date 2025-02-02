import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/data-access/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TokenRefreshService {
  private isRefreshing = signal(false);
  private currentToken = signal<string | null>(null);

  private refreshState = computed(() => ({
    isRefreshing: this.isRefreshing(),
    token: this.currentToken(),
  }));

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  public refreshToken(req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> {
    if (this.isRefreshing()) {
      return from(this.waitForToken()).pipe(
        switchMap(token => {
          return next(this.addToken(req, token));
        }),
      );
    }

    this.isRefreshing.set(true);
    this.currentToken.set(null);

    return this.authService.refreshToken().pipe(
      switchMap(newToken => {
        this.isRefreshing.set(false);
        this.currentToken.set(newToken);
        return next(this.addToken(req, newToken));
      }),
      catchError(error => {
        this.isRefreshing.set(false);
        this.currentToken.set(null);
        this.authService.logout();
        this.router.navigate(['/login']);
        return throwError(() => error);
      }),
    );
  }

  private async waitForToken(): Promise<string> {
    return new Promise(resolve => {
      const checkToken = () => {
        const token = this.currentToken();
        if (token) {
          resolve(token);
        } else if (!this.isRefreshing()) {
          resolve('');
        } else {
          setTimeout(checkToken, 100);
        }
      };
      checkToken();
    });
  }

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
