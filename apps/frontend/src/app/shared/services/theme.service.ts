import { Injectable, signal } from '@angular/core';
import { Theme } from '../types/common.type';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'theme';
  private readonly defaultTheme: Theme = 'light';

  private currentThemeSignal = signal<Theme>(this.defaultTheme);

  constructor(private readonly localStorageService: LocalStorageService) {
    this.initializeTheme();
  }

  public get currentTheme(): Theme {
    return this.currentThemeSignal();
  }

  public toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  public setTheme(theme: Theme): void {
    this.currentThemeSignal.set(theme);
    this.localStorageService.set(this.storageKey, theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private initializeTheme(): void {
    const savedTheme = this.localStorageService.get<Theme>(this.storageKey, this.defaultTheme);

    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.setTheme(savedTheme);
      return;
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }

    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        this.setTheme(e.matches ? 'dark' : 'light');
      });
  }
}
