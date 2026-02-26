import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LinkComponent } from '../atoms/link.component';

@Component({
  selector: 'app-footer',
  imports: [TranslateModule, RouterLink, LinkComponent],
  template: `
    <footer
      class="bg-background-secondary dark:bg-dark-background-secondary text-text-primary dark:text-dark-text-primary p-4 text-center text-sm"
    >
      &copy; {{ currentYear }} {{ 'Footer.text' | translate }}
      |
      <app-link [routerLink]="['/terms']">
        {{ 'Footer.terms' | translate }}
      </app-link>
      |
      <app-link [routerLink]="['/privacy-policy']">
        {{ 'Footer.privacyPolicy' | translate }}
      </app-link>
    </footer>
  `,
})
export class FooterComponent {
  protected currentYear: number = new Date().getFullYear();
}
