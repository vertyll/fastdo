import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class KeycloakAccountApi extends HttpApiService {
  /** Stores the language on the reader's Keycloak account, which Keycloak's pages show a signed-in person in. */
  public keepLanguage(language: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/auth/me/security/language`, { language });
  }
}
