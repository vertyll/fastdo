import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/data-access/auth.service';
import { TokenRefreshService } from '../../shared/services/token-refresh.service';

const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/refresh-token',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenRefreshService = inject(TokenRefreshService);
  const authService = inject(AuthService);

  req = req.clone({ withCredentials: true });

  const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => req.url.includes(endpoint));

  if (isPublicEndpoint) {
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
      if (error.status === HttpStatusCode.Unauthorized && !req.url.includes('/api/auth/refresh-token')) {
        return tokenRefreshService.refreshToken(req, next);
      }
      return throwError(() => error);
    }),
  );
};
