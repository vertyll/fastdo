import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [TranslateModule, RouterLink],
  styles: [
    `
      footer {
        @apply bg-background-secondary dark:bg-dark-background-secondary text-text-primary dark:text-dark-text-primary p-spacing-4 text-center;
      }
    `,
  ],
  template: `
    <footer>&copy;
      {{ currentYear }} {{ 'Footer.text' | translate }}
      |
      <a [routerLink]="['/terms']">
        {{ 'Footer.terms' | translate }}
      </a>
      |
      <a [routerLink]="['/privacy-policy']">
        {{ 'Footer.privacyPolicy' | translate }}
      </a>
    </footer>
  `,
})
export class FooterComponent {
  protected currentYear: number = new Date().getFullYear();
}
