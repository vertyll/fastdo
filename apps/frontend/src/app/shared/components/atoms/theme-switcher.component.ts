import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroMoon, heroSun } from '@ng-icons/heroicons/outline';
import { ThemeService } from '../../services/theme.service';
import { ThemeEnum } from '../../enums/theme.enum';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-theme-switcher',
  imports: [CommonModule, NgIconComponent, TranslatePipe],
  providers: [provideIcons({ heroSun, heroMoon })],
  template: `
    <button
      (click)="toggleTheme()"
      class="relative flex items-center justify-center p-2 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors duration-200"
      [attr.aria-label]="'Basic.toggleTheme' | translate"
    >
      @if (themeService.currentTheme === ThemeEnum.Dark) {
        <ng-icon name="heroSun" size="24" class="text-yellow-400" />
      } @else {
        <ng-icon name="heroMoon" size="24" class="text-text-muted dark:text-dark-text-muted" />
      }
    </button>
  `,
})
export class ThemeSwitcherComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly ThemeEnum = ThemeEnum;

  constructor() {
    effect(() => {});
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
