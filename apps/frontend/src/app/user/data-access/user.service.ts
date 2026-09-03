import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { UpdateProfilePayload, User } from '../defs/user.defs';
import { UserApiService } from './user.api.service';
import { UserStateService } from './user.state.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpService = inject(UserApiService);
  private readonly state = inject(UserStateService);

  public getCurrentUser(): Observable<ApiResponse<User>> {
    return this.httpService.getCurrentUser().pipe(tap(response => this.state.setUser(response.data)));
  }

  public updateProfile(payload: UpdateProfilePayload): Observable<ApiResponse<User>> {
    const current = this.state.user();
    if (!current) {
      throw new Error('profile has not been loaded yet');
    }
    return this.httpService
      .updateProfile(payload, current.version)
      .pipe(tap(response => this.state.setUser(response.data)));
  }
}
