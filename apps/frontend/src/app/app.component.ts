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
import { NotificationWebSocketService } from './shared/services/notification-websocket.service';

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
  private readonly translateService = inject(TranslateService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly autoLogoutService = inject(AutoLogoutService);
  private readonly notificationWebSocketService = inject(NotificationWebSocketService);

  constructor() {
    registerLocaleData(localePl, 'pl');
    registerLocaleData(localeEn, 'en');

    const availableLanguages: string[] = environment.availableLanguages;
    const defaultLanguage: string = environment.defaultLanguage;

    this.translateService.addLangs(availableLanguages);
    this.translateService.setDefaultLang(defaultLanguage);

    const savedLanguage: string = this.localStorageService.get<string>('selected_language', '');

    if (savedLanguage && availableLanguages.includes(savedLanguage)) {
      this.translateService.use(savedLanguage);
    } else {
      const browserLang = this.translateService.getBrowserLang() || '';
      const matchedLang = availableLanguages.includes(browserLang)
        ? browserLang
        : defaultLanguage;

      this.translateService.use(matchedLang);
      this.localStorageService.set('selected_language', matchedLang);
    }

    console.log('NotificationWebSocketService initialized');
  }

  ngOnDestroy(): void {
    this.autoLogoutService.stopWatching();
  }
}
