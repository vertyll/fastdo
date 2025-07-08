import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { FetchingError } from 'src/app/shared/types/list-state.type';
import { SimplePriority } from 'src/app/shared/types/simple-entities.type';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../shared/types/api-response.type';

@Injectable({
  providedIn: 'root',
})
export class PriorityApiService {
  private readonly URL = environment.backendUrl + '/api';
  private readonly http = inject(HttpClient);
  readonly $idle = signal(true);
  readonly $loading = signal(false);
  readonly $error = signal<FetchingError | null>(null);

  public getAll(): Observable<ApiResponse<SimplePriority[]>> {
    this.$loading.set(true);
    this.$idle.set(false);
    this.$error.set(null);

    return this.http.get<ApiResponse<SimplePriority[]>>(`${this.URL}/tasks/priorities`).pipe(
      tap(() => {
        this.$loading.set(false);
        this.$idle.set(true);
      }),
      catchError((error: HttpErrorResponse) => {
        this.$loading.set(false);
        this.$idle.set(true);
        this.$error.set({
          message: error.error?.message || 'An error occurred',
          status: error.status,
        });
        return EMPTY;
      }),
    );
  }
}
