import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/data-access/auth.service';
import { TokenRefreshService } from '../../shared/services/token-refresh.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenRefreshService = inject(TokenRefreshService);
  const authService = inject(AuthService);

  req = req.clone({ withCredentials: true });

  if (
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/refresh-token') ||
    req.url.includes('/api/auth/register') ||
    req.url.includes('/api/auth/forgot-password') ||
    req.url.includes('/api/auth/reset-password')
  ) {
    return next(req);
  }

  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/api/auth/refresh-token')) {
        return tokenRefreshService.refreshToken(req, next);
      }
      return throwError(() => error);
    }),
  );
};
