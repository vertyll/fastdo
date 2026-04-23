import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ThemeEnum } from '../enums/theme.enum';
import { LocalStorageService } from './local-storage.service';
import { THEME_KEY } from '../../app.contansts';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly DARK_MODE_MEDIA_QUERY = '(prefers-color-scheme: dark)';
  private readonly defaultTheme: ThemeEnum = ThemeEnum.Light;

  private readonly localStorageService = inject(LocalStorageService);
  private readonly document = inject(DOCUMENT);
  private readonly overlayContainer = inject(OverlayContainer);

  private readonly currentThemeSignal = signal<ThemeEnum>(this.defaultTheme);

  constructor() {
    this.initializeTheme();
  }

  public get currentTheme(): ThemeEnum {
    return this.currentThemeSignal();
  }

  public toggleTheme(): void {
    const newTheme = this.currentTheme === ThemeEnum.Light ? ThemeEnum.Dark : ThemeEnum.Light;
    this.setTheme(newTheme);
  }

  public setTheme(theme: ThemeEnum): void {
    this.currentThemeSignal.set(theme);
    this.localStorageService.set(THEME_KEY, theme);

    const isDarkTheme = theme === ThemeEnum.Dark;
    const overlayContainerClassList = this.overlayContainer.getContainerElement().classList;

    if (isDarkTheme) {
      this.document.documentElement.classList.add(ThemeEnum.Dark);
      overlayContainerClassList.add(ThemeEnum.Dark);
    } else {
      this.document.documentElement.classList.remove(ThemeEnum.Dark);
      overlayContainerClassList.remove(ThemeEnum.Dark);
    }
  }

  private initializeTheme(): void {
    const savedTheme = this.localStorageService.get<ThemeEnum>(THEME_KEY, this.defaultTheme);

    if (savedTheme && Object.values(ThemeEnum).includes(savedTheme)) {
      this.setTheme(savedTheme);
      return;
    }

    const mediaQuery = globalThis.matchMedia?.(this.DARK_MODE_MEDIA_QUERY);

    if (mediaQuery?.matches) {
      this.setTheme(ThemeEnum.Dark);
    } else {
      this.setTheme(ThemeEnum.Light);
    }

    mediaQuery?.addEventListener('change', e => {
      this.setTheme(e.matches ? ThemeEnum.Dark : ThemeEnum.Light);
    });
  }
}
