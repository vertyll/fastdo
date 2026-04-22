import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { Observable, catchError, EMPTY, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FetchingError } from '../defs/list-state.defs';

export abstract class HttpApiService {
  protected readonly http = inject(HttpClient);

  readonly $idle = signal(true);
  readonly $loading = signal(false);
  readonly $error = signal<FetchingError | null>(null);

  protected get baseUrl(): string {
    return `${environment.backendUrl}/api`;
  }

  protected withLoadingState<T>(source$: Observable<T>): Observable<T> {
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
