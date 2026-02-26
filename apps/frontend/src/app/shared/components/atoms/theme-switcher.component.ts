import { Component, inject } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroMoon, heroSun } from '@ng-icons/heroicons/outline';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [NgIconComponent, TranslatePipe],
  viewProviders: [provideIcons({ heroSun, heroMoon })],
  template: `
    <button
      (click)="themeService.toggleTheme()"
      class="inline-flex items-center justify-center p-2 rounded-lg transition-colors duration-200
    text-text-muted hover:text-text-primary hover:bg-neutral-50
    dark:text-dark-text-muted dark:hover:text-dark-text-primary dark:hover:bg-neutral-700"
      [attr.aria-label]="'Basic.toggleTheme' | translate"
    >
      @if (themeService.currentTheme === 'dark') {
        <ng-icon name="heroSun" size="24" class="text-yellow-400" />
      } @else {
        <ng-icon name="heroMoon" size="24" class="text-text-muted dark:text-dark-text-muted" />
      }
    </button>
  `,
})
export class ThemeSwitcherComponent {
  protected readonly themeService = inject(ThemeService);
}
