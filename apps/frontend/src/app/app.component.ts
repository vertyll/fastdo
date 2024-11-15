import { Component } from '@angular/core';
import { LayoutComponent } from './shared/components/templates/layout.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterOutlet } from '@angular/router';
import { ModalComponent } from './shared/components/organisms/modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent, RouterOutlet, TranslateModule, ModalComponent],
  template: `
    <app-layout>
      <router-outlet></router-outlet>
      <app-modal></app-modal>
    </app-layout>
  `,
})
export class AppComponent {
  constructor(private translateService: TranslateService) {
    this.translateService.addLangs(['pl', 'en']);
    this.translateService.setDefaultLang('pl');
    this.translateService.use('pl');
  }
}
