import { Injectable, computed, inject, signal } from '@angular/core';
import { Project } from '../model/Project';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { FetchingError } from 'src/app/utils/list-state.type';

export type GetAllProjectsSearchParams = {
  q: string;
  sortBy: 'createdAt' | 'name';
  orderBy: 'desc' | 'asc';
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
};

export type LoadingState = {
  idle: boolean;
  loading: boolean;
  error: FetchingError | null;
};

@Injectable({
  providedIn: 'root',
})
export class ProjectsApiService {
  private URL = 'http://localhost:3000';

  private http = inject(HttpClient);

  private $idle = signal(true);
  private $loading = signal(false);
  private $error = signal<FetchingError | null>(null);

  $loadingState = computed(() => {
    return {
      idle: this.$idle(),
      loading: this.$loading(),
      error: this.$error(),
    };
  });

  withLoadingState<T>(source$: Observable<T>): Observable<T> {
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

  getAll(searchParams?: GetAllProjectsSearchParams) {
    return this.withLoadingState(
      this.http.get<Project[]>(`${this.URL}/projects`, {
        observe: 'response',
        params: searchParams,
      }),
    );
  }

  delete(projectId: number) {
    return this.http.delete(`${this.URL}/projects/${projectId}`);
  }

  update(projectId: number, name: string) {
    return this.http.patch<Project>(`${this.URL}/projects/${projectId}`, {
      name,
    });
  }

  add(name: string) {
    return this.http.post<Project>(`${this.URL}/projects`, { name });
  }
}
