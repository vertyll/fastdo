import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FetchingError } from '../defs/list-state.defs';
import { errorKeyOf } from '../utils/api-error.utils';

export abstract class HttpApiService {
  protected readonly http = inject(HttpClient);

  public readonly $idle = signal(true);
  public readonly $loading = signal(false);
  public readonly $error = signal<FetchingError | null>(null);

  protected get baseUrl(): string {
    return environment.apiUrl;
  }

  protected ifMatch(version: number | null | undefined): HttpHeaders | undefined {
    return version === null || version === undefined ? undefined : new HttpHeaders({ 'If-Match': `W/"${version}"` });
  }

  protected withLoadingState<T>(source$: Observable<T>): Observable<T> {
    this.$idle.set(false);
    this.$error.set(null);
    this.$loading.set(true);

    return source$.pipe(
      catchError((e: HttpErrorResponse) => {
        this.$error.set({ code: errorKeyOf(e), status: e.status });
        this.$loading.set(false);
        return throwError(() => e);
      }),
      tap(() => {
        this.$loading.set(false);
      }),
    );
  }
}
