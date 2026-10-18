import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LanguageService } from '../../shared/services/language.service';
import { ThemeService } from '../../shared/services/theme.service';

/**
 * Keycloak's sign-in, reached through the back-end, in FastDo's language and the theme the reader chose, which
 * Keycloak's pages take from the `ui_locales` and `theme` parameters on their first page.
 */
@Injectable({
  providedIn: 'root',
})
export class KeycloakPages {
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);

  /** Signs the reader in, and brings them back to `returnTo`, the page of FastDo they were on. */
  public signIn(returnTo: string): void {
    this.open(returnTo, {});
  }

  /** The sign-in, back to `returnTo`, with Keycloak's parameters for one page of a signed-in reader's account. */
  public open(returnTo: string, parameters: Record<string, string>): void {
    // A theme FastDo only follows from the system is not passed on, so Keycloak's pages follow the system too.
    const chosen = this.themeService.chosenTheme();
    const query = new URLSearchParams({
      ...parameters,
      ...(chosen === null ? {} : { theme: chosen }),
      ui_locales: this.languageService.current(),
      return_to: returnTo,
    });
    window.location.href = `${environment.apiUrl}/auth/authorize?${query}`;
  }
}
