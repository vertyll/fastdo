import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [TranslateModule],
  styles: [
    `
      footer {
        @apply bg-gray-800 text-white p-4 text-center;
      }
    `,
  ],
  template: `
    <footer>&copy; {{ currentYear }} {{ 'Footer.text' | translate }}</footer>
  `,
})
export class FooterComponent {
  protected currentYear: number = new Date().getFullYear();
}
