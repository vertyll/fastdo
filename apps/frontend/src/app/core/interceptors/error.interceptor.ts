import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthStateService } from '../../auth/data-access/auth.state.service';
import { KeycloakPages } from '../keycloak';
import { ToastService } from '../../shared/services/toast.service';
import { errorKeyOf, errorParamsOf, fieldErrorsOf } from '../../shared/utils/api-error.utils';

const NETWORK_UNREACHABLE = 'Errors.network';
const UNEXPECTED = 'Errors.unexpected';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStateService = inject(AuthStateService);
  const toastService = inject(ToastService);
  const keycloakPages = inject(KeycloakPages);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === HttpStatusCode.Unauthorized) {
        // A session that ended while FastDo was open: sign in again, and come back to this page.
        const wasSignedIn = authStateService.isLoggedIn();
        authStateService.clear();
        if (wasSignedIn) {
          keycloakPages.signIn(router.url);
        }
        return throwError(() => error);
      }

      if (Object.keys(fieldErrorsOf(error)).length === 0) {
        toastService.presentError(messageKeyOf(error), errorParamsOf(error));
      }

      return throwError(() => error);
    }),
  );
};

function messageKeyOf(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return NETWORK_UNREACHABLE;
  }
  return errorKeyOf(error) ?? UNEXPECTED;
}
