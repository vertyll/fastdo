import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LinkComponent } from '../atoms/link.component';

@Component({
  selector: 'app-footer',
  imports: [TranslateModule, RouterLink, LinkComponent],
  template: `
    <footer
      class="bg-background-secondary dark:bg-dark-background-secondary text-text-primary dark:text-dark-text-primary p-4 text-center text-sm flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4"
    >
      <span>&copy; {{ currentYear }} {{ 'Footer.text' | translate }}</span>
      <span class="hidden md:inline text-text-secondary dark:text-dark-text-secondary">|</span>
      <app-link [routerLink]="['/terms']">
        {{ 'Footer.terms' | translate }}
      </app-link>
      <span class="hidden md:inline text-text-secondary dark:text-dark-text-secondary">|</span>
      <app-link [routerLink]="['/privacy-policy']">
        {{ 'Footer.privacyPolicy' | translate }}
      </app-link>
    </footer>
  `,
})
export class FooterComponent {
  protected currentYear: number = new Date().getFullYear();
}
