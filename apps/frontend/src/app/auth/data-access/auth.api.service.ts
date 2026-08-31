import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { Session } from '../defs/auth.defs';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService extends HttpApiService {
  public session(): Observable<ApiResponse<Session>> {
    return this.http.get<ApiResponse<Session>>(`${this.baseUrl}/auth/session`);
  }

  public logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/logout`, {});
  }
}
