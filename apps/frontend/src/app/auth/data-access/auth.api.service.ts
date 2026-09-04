import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { Session } from '../defs/auth.defs';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService extends HttpApiService {
  public session(): Observable<Session> {
    return this.http.get<Session>(`${this.baseUrl}/auth/session`);
  }

  public logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, {});
  }
}
