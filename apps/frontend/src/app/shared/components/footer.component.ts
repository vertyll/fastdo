import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslateModule],
  styles: [
    `
      .page-container {
        @apply flex flex-col min-h-screen;
      }

      .content {
        @apply flex-1;
      }

      footer {
        @apply bg-gray-800 text-white p-4 text-center mt-auto;
      }
    `,
  ],
  template: `
    <div class="page-container">
      <div class="content">
        <ng-content></ng-content>
      </div>
      <footer>&copy; {{ currentYear }} {{ 'Footer.text' | translate }}</footer>
    </div>
  `,
})
export class FooterComponent {
  protected currentYear: number = new Date().getFullYear();
}
