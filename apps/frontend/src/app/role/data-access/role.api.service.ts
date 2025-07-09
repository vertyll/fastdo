import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { FetchingError } from 'src/app/shared/types/list-state.type';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../shared/types/api-response.type';
import { Role } from '../../shared/types/entities.type';

@Injectable({
  providedIn: 'root',
})
export class RoleApiService {
  private readonly URL = environment.backendUrl + '/api';
  private readonly http = inject(HttpClient);
  readonly $idle = signal(true);
  readonly $error = signal<FetchingError | null>(null);

  public getAllRoles(lang?: string): Observable<ApiResponse<Role[]>> {
    this.$idle.set(false);
    this.$error.set(null);

    const options: { headers?: Record<string, string>; } = {};
    if (lang) {
      options.headers = { 'x-lang': lang };
    }

    return this.http.get<ApiResponse<Role[]>>(`${this.URL}/roles`, options).pipe(
      tap(() => this.$idle.set(true)),
      catchError((error: HttpErrorResponse) => {
        this.$idle.set(true);
        this.$error.set({
          message: error.message,
          status: error.status,
        });
        return EMPTY;
      }),
    );
  }
}
