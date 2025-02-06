import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { FetchingError } from 'src/app/shared/types/list-state.type';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../shared/types/api-response.type';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly URL = environment.backendUrl + '/api';
  private readonly http = inject(HttpClient);
  readonly $idle = signal(true);
  readonly $loading = signal(false);
  readonly $error = signal<FetchingError | null>(null);

  public getCurrentUser(): Observable<ApiResponse<User>> {
    return this.withLoadingState(this.http.get<ApiResponse<User>>(`${this.URL}/users/me`));
  }

  public updateProfile(formData: FormData): Observable<ApiResponse<User>> {
    return this.withLoadingState(this.http.put<ApiResponse<User>>(`${this.URL}/users/me`, formData));
  }

  private withLoadingState<T>(source$: Observable<T>): Observable<T> {
    this.$idle.set(false);
    this.$error.set(null);
    this.$loading.set(true);

    return source$.pipe(
      catchError((e: HttpErrorResponse) => {
        this.$error.set({ message: e.message, status: e.status });
        this.$loading.set(false);
        return EMPTY;
      }),
      tap(() => {
        this.$loading.set(false);
      }),
    );
  }
}
