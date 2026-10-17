import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localePl from '@angular/common/locales/pl';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { DOCUMENT } from '@angular/common';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { getCookie } from '../../shared/utils/cookies';
import { SIGN_IN_LANGUAGE_COOKIE, sharedCookieDomain } from '../../shared/utils/sign-in-theme';

const SELECTED_LANGUAGE_KEY = 'selected_language';

export function initializeLanguage(): void {
  registerLocaleData(localePl, 'pl');
  registerLocaleData(localeEn, 'en');

  const translate = inject(TranslateService);
  const storage = inject(LocalStorageService);

  translate.addLangs(environment.availableLanguages);
  translate.setFallbackLang(environment.defaultLanguage);

  const fromSignIn = takeSignInLanguage(inject(DOCUMENT));
  if (fromSignIn !== null && environment.availableLanguages.includes(fromSignIn)) {
    translate.use(fromSignIn);
    storage.set(SELECTED_LANGUAGE_KEY, fromSignIn);
    return;
  }

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

// A language chosen on Keycloak's pages comes back in a cookie, as the sign-in returns to an address that carries
// nothing else; it is taken over once.
function takeSignInLanguage(document: Document): string | null {
  const value = getCookie(SIGN_IN_LANGUAGE_COOKIE);
  if (value === null) {
    return null;
  }
  const domain = sharedCookieDomain(document.location.hostname);
  document.cookie = `${SIGN_IN_LANGUAGE_COOKIE}=; Max-Age=0; Path=/${domain === null ? '' : `; Domain=${domain}`}`;
  return value;
}
