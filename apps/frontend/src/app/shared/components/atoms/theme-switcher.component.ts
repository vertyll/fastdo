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
      class="relative flex items-center justify-center p-2 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors duration-200"
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
