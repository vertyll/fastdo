import { Component, inject } from '@angular/core';
import { LayoutComponent } from './shared/components/templates/layout.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalComponent } from './shared/components/organisms/modal.component';

@Component({
    selector: 'app-root',
    imports: [LayoutComponent, TranslateModule, ModalComponent],
    template: `
    <app-layout>
      <app-modal />
    </app-layout>
  `
})
export class AppComponent {
  private readonly translateService = inject(TranslateService);

  constructor() {
    this.translateService.addLangs(['pl', 'en']);
    this.translateService.setDefaultLang('pl');
    this.translateService.use('pl');
  }
}
