import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { UpdateProfilePayload, User } from '../defs/user.defs';

@Injectable({
  providedIn: 'root',
})
export class UserApiService extends HttpApiService {
  public getCurrentUser(): Observable<User> {
    return this.withLoadingState(this.http.get<User>(`${this.baseUrl}/auth/me`));
  }

  public updateProfile(payload: UpdateProfilePayload, version: number | null): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/me`, payload, {
      headers: this.ifMatch(version),
    });
  }
}
