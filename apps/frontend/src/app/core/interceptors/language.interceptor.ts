import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService } from '../../shared/services/language.service';
import { environment } from 'src/environments/environment';
import { X_LANG_HEADER } from '../../app.constants';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  // The language is set at start-up, before the first call to the API; the catalogue loads without interceptors.
  const lang = inject(LanguageService).current();

  return next(
    req.clone({
      headers: req.headers.set(X_LANG_HEADER, lang),
    }),
  );
};
