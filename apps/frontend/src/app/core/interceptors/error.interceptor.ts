import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthStateService } from '../../auth/data-access/auth.state.service';
import { ToastService } from '../../shared/services/toast.service';
import { errorKeyOf, errorParamsOf, fieldErrorsOf } from '../../shared/utils/api-error.utils';

const NETWORK_UNREACHABLE = 'Errors.network';
const UNEXPECTED = 'Errors.unexpected';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStateService = inject(AuthStateService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === HttpStatusCode.Unauthorized) {
        authStateService.clear();
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
