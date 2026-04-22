import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localePl from '@angular/common/locales/pl';
import { Component, OnDestroy, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { AutoLogoutService } from './auth/data-access/auto-logout.service';
import { ModalComponent } from './shared/components/organisms/modal.component';
import { LayoutComponent } from './shared/components/templates/layout.component';
import { LocalStorageService } from './shared/services/local-storage.service';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent, TranslateModule, ModalComponent],
  template: `
    <app-layout>
      <app-modal />
    </app-layout>
  `,
})
export class AppComponent implements OnDestroy {
  private readonly selectedLanguageKey = 'selected_language';
  private readonly availableLanguages: string[] = environment.availableLanguages;
  private readonly defaultLanguage: string = environment.defaultLanguage;

  private readonly translateService = inject(TranslateService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly autoLogoutService = inject(AutoLogoutService);

  constructor() {
    this.registerLocales();
    this.initializeLanguage();
  }

  private registerLocales(): void {
    registerLocaleData(localePl, 'pl');
    registerLocaleData(localeEn, 'en');
  }

  private initializeLanguage(): void {
    this.translateService.addLangs(this.availableLanguages);
    this.translateService.setFallbackLang(this.defaultLanguage);

    const savedLanguage: string = this.localStorageService.get<string>(this.selectedLanguageKey, '');
    if (savedLanguage && this.availableLanguages.includes(savedLanguage)) {
      this.translateService.use(savedLanguage);
      return;
    }

    const browserLang = this.translateService.getBrowserLang() || '';
    const matchedLang = this.availableLanguages.includes(browserLang) ? browserLang : this.defaultLanguage;

    this.translateService.use(matchedLang);
    this.localStorageService.set(this.selectedLanguageKey, matchedLang);
  }

  ngOnDestroy(): void {
    this.autoLogoutService.stopWatching();
  }
}
