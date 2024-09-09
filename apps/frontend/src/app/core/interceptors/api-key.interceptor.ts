import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const apiKey = environment.apiKey;
  const modifiedReq = req.clone({
    setHeaders: {
      Authorization: apiKey,
    },
  });
  return next(modifiedReq);
};
