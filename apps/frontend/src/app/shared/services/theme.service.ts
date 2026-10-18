import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ThemeEnum } from '../enums/theme.enum';
import { LocalStorageService } from './local-storage.service';
import { THEME_KEY } from '../../app.constants';

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
  private readonly chosenThemeSignal = signal<ThemeEnum | null>(null);

  public readonly theme = this.currentThemeSignal.asReadonly();

  /** The theme the reader chose, here or elsewhere; `null` while FastDo follows the system's. */
  public readonly chosenTheme = this.chosenThemeSignal.asReadonly();

  constructor() {
    this.initializeTheme();
  }

  public toggleTheme(): void {
    const newTheme = this.theme() === ThemeEnum.Light ? ThemeEnum.Dark : ThemeEnum.Light;
    this.setTheme(newTheme);
  }

  /** Shows the theme the reader chose, here or elsewhere, which from then on no longer follows the system's. */
  public setTheme(theme: ThemeEnum): void {
    this.chosenThemeSignal.set(theme);
    this.localStorageService.set(THEME_KEY, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemeEnum): void {
    this.currentThemeSignal.set(theme);

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
    const savedTheme = this.localStorageService.get<ThemeEnum | null>(THEME_KEY, null);

    if (savedTheme !== null && Object.values(ThemeEnum).includes(savedTheme)) {
      this.setTheme(savedTheme);
      return;
    }

    const mediaQuery = globalThis.matchMedia?.(this.DARK_MODE_MEDIA_QUERY);

    this.applyTheme(mediaQuery?.matches ? ThemeEnum.Dark : ThemeEnum.Light);

    mediaQuery?.addEventListener('change', e => {
      if (this.chosenThemeSignal() === null) {
        this.applyTheme(e.matches ? ThemeEnum.Dark : ThemeEnum.Light);
      }
    });
  }
}
