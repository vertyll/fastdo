import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthStateService } from '../../auth/data-access/auth.state.service';
import { SESSION_ENDPOINT } from '../../app.contansts';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStateService = inject(AuthStateService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === HttpStatusCode.Unauthorized && !req.url.endsWith(SESSION_ENDPOINT)) {
        authStateService.clear();
      }
      return throwError(() => error);
    }),
  );
};
