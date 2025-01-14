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
    this.translateService.addLangs(['pl', 'en']);
    this.translateService.setDefaultLang('pl');
    const savedLanguage = this.localStorageService.get<string>('selectedLanguage', 'pl');
    this.translateService.use(savedLanguage);
  }
}
