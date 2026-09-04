import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localePl from '@angular/common/locales/pl';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { LocalStorageService } from '../../shared/services/local-storage.service';

const SELECTED_LANGUAGE_KEY = 'selected_language';

export function initializeLanguage(): void {
  registerLocaleData(localePl, 'pl');
  registerLocaleData(localeEn, 'en');

  const translate = inject(TranslateService);
  const storage = inject(LocalStorageService);

  translate.addLangs(environment.availableLanguages);
  translate.setFallbackLang(environment.defaultLanguage);

  const saved = storage.get<string>(SELECTED_LANGUAGE_KEY, '');
  if (saved && environment.availableLanguages.includes(saved)) {
    translate.use(saved);
    return;
  }

  const browser = translate.getBrowserLang() || '';
  const matched = environment.availableLanguages.includes(browser) ? browser : environment.defaultLanguage;

  translate.use(matched);
  storage.set(SELECTED_LANGUAGE_KEY, matched);
}
