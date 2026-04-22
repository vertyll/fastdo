import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/types/api-response.type';
import { User } from '../defs/user.defs';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserApiService extends HttpApiService {
  public getCurrentUser(): Observable<ApiResponse<User>> {
    return this.withLoadingState(this.http.get<ApiResponse<User>>(`${this.baseUrl}/users/me`));
  }

  public updateProfile(formData: FormData): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/users/me`, formData);
  }
}
