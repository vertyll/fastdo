import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ThemeEnum } from '../enums/theme.enum';
import { LocalStorageService } from './local-storage.service';
import { THEME_KEY } from '../../app.constants';
import { getCookie } from '../utils/cookies';
import { SHARED_THEME_COOKIE, sharedCookieDomain, sharedTheme } from '../utils/sign-in-theme';

const ONE_YEAR = 60 * 60 * 24 * 365;

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
    this.shareTheme(theme);

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
    const shared = sharedTheme(getCookie(SHARED_THEME_COOKIE));
    if (shared !== null) {
      this.setTheme(shared);
      return;
    }

    const savedTheme = this.localStorageService.get<ThemeEnum>(THEME_KEY, this.defaultTheme);

    if (Object.values(ThemeEnum).includes(savedTheme)) {
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

  // Keycloak's pages read the theme from the shared cookie, and write a choice made there into it.
  private shareTheme(theme: ThemeEnum): void {
    const domain = sharedCookieDomain(this.document.location.hostname);
    const secure = this.document.location.protocol === 'https:' ? '; Secure' : '';
    this.document.cookie = `${SHARED_THEME_COOKIE}=${theme}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${
      domain === null ? '' : `; Domain=${domain}`
    }${secure}`;
  }
}
