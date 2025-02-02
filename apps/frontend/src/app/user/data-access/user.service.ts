import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../../shared/types/api-response.type';
import { User } from '../models/User';
import { UserApiService } from './user.api.service';
import { UserStateService } from './user.state.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpService = inject(UserApiService);
  private readonly state = inject(UserStateService);

  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.httpService.getCurrentUser().pipe(
      tap(response => {
        this.state.setUser(response.data);
      }),
    );
  }

  updateProfile(formData: FormData): Observable<ApiResponse<User>> {
    return this.httpService.updateProfile(formData).pipe(
      tap(response => {
        this.state.setUser(response.data);
      }),
    );
  }
}
