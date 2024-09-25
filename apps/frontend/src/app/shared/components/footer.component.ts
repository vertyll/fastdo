import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
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
      <footer>&copy; {{ currentYear }} Todo List App - Mikołaj Gawron</footer>
    </div>
  `,
})
export class FooterComponent {
  protected currentYear: number = new Date().getFullYear();
}
