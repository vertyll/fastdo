import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, InjectionToken, Signal, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LanguageService } from '../../shared/services/language.service';
import { ThemeService } from '../../shared/services/theme.service';
import { KeycloakAccountApi } from './keycloak-account.api';
import { SHARED_LANGUAGE_COOKIE, SHARED_THEME_COOKIE, readShared, sharedTheme, writeShared } from './shared-cookies';

/** Whether a reader is signed in, as the application knows it; given by `provideKeycloak`. */
export const KEYCLOAK_SIGNED_IN = new InjectionToken<Signal<boolean>>('KEYCLOAK_SIGNED_IN');

/**
 * What FastDo shares with Keycloak's pages: the reader's theme and language, both ways. It watches the theme and the
 * language the reader chooses, so the rest of FastDo knows nothing of Keycloak.
 */
@Injectable({
  providedIn: 'root',
})
export class KeycloakPreferences {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly signedIn = inject(KEYCLOAK_SIGNED_IN);
  private readonly accountApi = inject(KeycloakAccountApi);
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);
  private started = false;

  constructor() {
    effect(() => this.shareChosenTheme());
  }

  /**
   * Shows the theme last chosen on Keycloak's pages, and from then on shares each language the reader picks. Only the
   * first call does anything, so a choice is never shared twice.
   */
  public start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    const theme = sharedTheme(readShared(SHARED_THEME_COOKIE));
    if (theme !== null) {
      this.themeService.setTheme(theme);
    }
    this.languageService.chosen$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(language => this.languageChosen(language));
  }

  /** The language last chosen here or on Keycloak's pages, when one was. */
  public chosenLanguage(): string | null {
    return readShared(SHARED_LANGUAGE_COOKIE);
  }

  // Only a theme the reader chose goes to Keycloak's pages; while FastDo follows the system, they follow it too.
  private shareChosenTheme(): void {
    const theme = this.themeService.chosenTheme();
    if (theme !== null) {
      writeShared(this.document, SHARED_THEME_COOKIE, theme);
    }
  }

  // Keycloak shows a signed-in reader their account's language, so the choice goes there too.
  private languageChosen(language: string): void {
    writeShared(this.document, SHARED_LANGUAGE_COOKIE, language);
    if (this.signedIn()) {
      this.accountApi.keepLanguage(language).subscribe();
    }
  }
}
