import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
export class AppComponent {
  private readonly translateService = inject(TranslateService);
  private readonly localStorageService = inject(LocalStorageService);

  constructor() {
    const availableLanguages = ['pl', 'en'];
    const defaultLanguage = 'pl';

    this.translateService.addLangs(availableLanguages);
    this.translateService.setDefaultLang(defaultLanguage);

    const savedLanguage = this.localStorageService.get<string>('selected_language', '');

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
  }
}
