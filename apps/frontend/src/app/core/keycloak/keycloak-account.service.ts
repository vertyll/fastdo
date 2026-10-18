import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { LanguageService } from '../../shared/services/language.service';
import { KeycloakAccountApi } from './keycloak-account.api';
import { KeycloakPages } from './keycloak-pages.service';
import { SecuritySettings } from './security-settings';

/**
 * A page Keycloak shows to a signed-in reader before returning here: changing the password, setting up the second
 * factor, or removing a credential named by its id, which Keycloak asks to confirm.
 */
type AccountAction = 'UPDATE_PASSWORD' | 'CONFIGURE_TOTP' | `delete_credential:${string}`;

/** The signed-in reader's account on Keycloak: the password and the second factor, each on Keycloak's own pages. */
@Injectable({
  providedIn: 'root',
})
export class KeycloakAccount {
  private readonly pages = inject(KeycloakPages);
  private readonly router = inject(Router);
  private readonly accountApi = inject(KeycloakAccountApi);
  private readonly languageService = inject(LanguageService);

  /** The reader's second factor, or `null` when Keycloak could not be asked, so the profile offers neither action. */
  public securitySettings(): Observable<SecuritySettings | null> {
    return this.accountApi.securitySettings().pipe(catchError(() => of(null)));
  }

  public changePassword(): void {
    this.start('UPDATE_PASSWORD');
  }

  /** Turns the second factor on when there is none, and off, after Keycloak asks to confirm, when there is one. */
  public toggleSecondFactor(settings: SecuritySettings): void {
    const credentialId = settings.twoFactorCredentialId;
    this.start(credentialId ? `delete_credential:${credentialId}` : 'CONFIGURE_TOTP');
  }

  // Keycloak shows a signed-in reader their account's language, so FastDo's is stored there first.
  private start(action: AccountAction): void {
    this.accountApi
      .keepLanguage(this.languageService.current())
      .subscribe(() => this.pages.open(this.router.url, { kc_action: action }));
  }
}
