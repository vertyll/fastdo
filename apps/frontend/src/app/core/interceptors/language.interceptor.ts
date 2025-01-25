import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const translateService = inject(TranslateService);
  const lang = translateService.currentLang || environment.defaultLanguage;

  return next(req.clone({
    headers: req.headers.set('x-lang', lang),
  }));
};
