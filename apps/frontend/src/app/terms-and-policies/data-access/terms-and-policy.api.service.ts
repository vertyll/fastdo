import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { FetchingError } from 'src/app/shared/types/list-state.type';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../shared/types/api-response.type';
import { PrivacyPolicy } from '../model/Privacy-policy';
import { Terms } from '../model/Terms';

@Injectable({
  providedIn: 'root',
})
export class TermsAndPolicyApiService {
  private readonly URL = environment.backendUrl;
  private readonly http = inject(HttpClient);
  readonly $idle = signal(true);
  readonly $loading = signal(false);
  readonly $error = signal<FetchingError | null>(null);

  public getTerms(): Observable<ApiResponse<Terms>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<Terms>>(`${this.URL}/terms-and-policies/terms`),
    );
  }

  public getPrivacyPolicy(): Observable<ApiResponse<PrivacyPolicy>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<PrivacyPolicy>>(`${this.URL}/terms-and-policies/privacy-policy`),
    );
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
