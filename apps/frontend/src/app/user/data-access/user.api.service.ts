import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { UpdateProfilePayload, User } from '../defs/user.defs';

@Injectable({
  providedIn: 'root',
})
export class UserApiService extends HttpApiService {
  public getCurrentUser(): Observable<ApiResponse<User>> {
    return this.withLoadingState(this.http.get<ApiResponse<User>>(`${this.baseUrl}/auth/me`));
  }

  public updateProfile(payload: UpdateProfilePayload, version: number | null): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/users/me`, payload, {
      headers: this.ifMatch(version),
    });
  }
}
