import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { SecuritySettings } from './security-settings';

@Injectable({
  providedIn: 'root',
})
export class KeycloakAccountApi extends HttpApiService {
  public securitySettings(): Observable<SecuritySettings> {
    return this.http.get<SecuritySettings>(`${this.baseUrl}/auth/me/security`);
  }

  /**
   * Stores the language on the reader's Keycloak account, which Keycloak's pages show a signed-in person in. A failure
   * is not an error: the language still holds here, and is stored again before the next account action.
   */
  public keepLanguage(language: string): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/auth/me/security/language`, { language })
      .pipe(catchError(() => of(void 0)));
  }
}
