import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localePl from '@angular/common/locales/pl';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { LanguageService } from '../../shared/services/language.service';
import { SELECTED_LANGUAGE_KEY } from '../../app.constants';
import { KeycloakPreferences } from '../keycloak';

export function initializeLanguage(): void {
  registerLocaleData(localePl, 'pl');
  registerLocaleData(localeEn, 'en');

  const translate = inject(TranslateService);
  const storage = inject(LocalStorageService);
  const keycloak = inject(KeycloakPreferences);

  translate.addLangs(environment.availableLanguages);
  translate.setFallbackLang(environment.defaultLanguage);

  inject(LanguageService).start(startingLanguage(translate, storage, keycloak));
}

/**
 * The language last chosen here or on Keycloak's pages, else the one saved here, else the browser's, else the default.
 */
function startingLanguage(
  translate: TranslateService,
  storage: LocalStorageService,
  keycloak: KeycloakPreferences,
): string {
  const available = (language: string | null | undefined): language is string =>
    !!language && environment.availableLanguages.includes(language);
  const shared = keycloak.chosenLanguage();
  if (available(shared)) {
    return shared;
  }
  const saved = storage.get<string | null>(SELECTED_LANGUAGE_KEY, null);
  if (available(saved)) {
    return saved;
  }
  const browser = translate.getBrowserLang();
  return available(browser) ? browser : environment.defaultLanguage;
}
