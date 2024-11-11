import { Component } from '@angular/core';
import { LayoutComponent } from './shared/layout/layout.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent, RouterOutlet, TranslateModule],
  template: `
    <app-layout>
      <router-outlet></router-outlet>
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
