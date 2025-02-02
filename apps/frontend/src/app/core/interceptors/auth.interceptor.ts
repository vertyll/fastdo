import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenRefreshService } from '../../shared/services/token-refresh.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenRefreshService = inject(TokenRefreshService);

  if (
    req.url.includes('/auth/login')
    || req.url.includes('/auth/refresh-token')
    || req.url.includes('/auth/register')
    || req.url.includes('/auth/forgot-password')
    || req.url.includes('/auth/reset-password')
  ) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh-token')) {
        return tokenRefreshService.refreshToken(req, next);
      }
      return throwError(() => error);
    }),
  );
};
