import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable, catchError, of } from 'rxjs';
import { AuthStateService } from '../../auth/data-access/auth.state.service';
import { ThemeEnum } from '../../shared/enums/theme.enum';
import { KeycloakAccountApi } from './keycloak-account.api';
import { SHARED_LANGUAGE_COOKIE, SHARED_THEME_COOKIE, readShared, sharedTheme, writeShared } from './shared-cookies';

/** What FastDo shares with Keycloak's pages: the reader's theme and language, both ways. */
@Injectable({
  providedIn: 'root',
})
export class KeycloakPreferences {
  private readonly document = inject(DOCUMENT);
  private readonly authState = inject(AuthStateService);
  private readonly accountApi = inject(KeycloakAccountApi);

  /** The theme last chosen here or on Keycloak's pages, when one was. */
  public chosenTheme(): ThemeEnum | null {
    return sharedTheme(readShared(SHARED_THEME_COOKIE));
  }

  /** Records a theme chosen here, for Keycloak's pages. */
  public themeChosen(theme: ThemeEnum): void {
    writeShared(this.document, SHARED_THEME_COOKIE, theme);
  }

  /** The language last chosen here or on Keycloak's pages, when one was. */
  public chosenLanguage(): string | null {
    return readShared(SHARED_LANGUAGE_COOKIE);
  }

  /**
   * Records a language chosen here, for Keycloak's pages: in the shared cookie, and on the signed-in reader's account,
   * which Keycloak shows a signed-in person in.
   */
  public languageChosen(language: string): void {
    writeShared(this.document, SHARED_LANGUAGE_COOKIE, language);
    if (this.authState.isLoggedIn()) {
      this.keepAccountLanguage(language).subscribe();
    }
  }

  /**
   * Stores the language on the signed-in reader's Keycloak account; when Keycloak cannot store it, the choice still
   * holds here, so the result completes either way.
   */
  public keepAccountLanguage(language: string): Observable<void> {
    return this.accountApi.keepLanguage(language).pipe(catchError(() => of(void 0)));
  }
}
