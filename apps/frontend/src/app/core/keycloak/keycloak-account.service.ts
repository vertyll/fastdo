import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../auth/data-access/auth.service';
import { KeycloakAccountApi } from './keycloak-account.api';
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
  private readonly authService = inject(AuthService);
  private readonly accountApi = inject(KeycloakAccountApi);
  private readonly translateService = inject(TranslateService);

  /** The reader's second factor, or `null` when Keycloak could not be asked. */
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

  private start(action: AccountAction): void {
    // Keycloak shows a signed-in reader their account's language, so FastDo's is stored there first; when Keycloak
    // cannot store it, the action still opens.
    const language = this.translateService.getCurrentLang() || environment.defaultLanguage;
    this.accountApi
      .keepLanguage(language)
      .pipe(catchError(() => of(void 0)))
      .subscribe(() => this.authService.authorize({ kc_action: action }));
  }
}
