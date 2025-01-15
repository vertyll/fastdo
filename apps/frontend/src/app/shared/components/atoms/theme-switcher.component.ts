import { Component, inject } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroMoon, heroSun } from '@ng-icons/heroicons/outline';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [NgIconComponent],
  viewProviders: [
    provideIcons({ heroSun, heroMoon }),
  ],
  template: `
    <button
      (click)="themeService.toggleTheme()"
      class="inline-flex items-center justify-center p-2 rounded-lg transition-colors duration-200
        text-gray-500 hover:text-gray-900 hover:bg-gray-50
        dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
      aria-label="Toggle theme"
    >
      @if (themeService.currentTheme === 'dark') {
        <ng-icon
          name="heroSun"
          size="24"
          class="text-yellow-400"
        />
      } @else {
        <ng-icon
          name="heroMoon"
          size="24"
          class="text-gray-500"
        />
      }
    </button>
  `,
})
export class ThemeSwitcherComponent {
  protected readonly themeService = inject(ThemeService);
}
