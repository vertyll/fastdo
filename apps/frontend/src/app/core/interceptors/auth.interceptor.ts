import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.url.startsWith(environment.apiUrl) ? req.clone({ withCredentials: true }) : req);
