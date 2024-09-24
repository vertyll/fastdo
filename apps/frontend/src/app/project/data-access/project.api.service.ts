import { Injectable, computed, inject, signal } from '@angular/core';
import { Project } from '../models/Project';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FetchingError } from 'src/app/shared/types/list-state.type';

export type GetAllProjectsSearchParams = {
  q: string;
  sortBy: 'dateCreation' | 'name';
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
  private readonly URL = environment.backendUrl;
  private readonly http = inject(HttpClient);

  private readonly $idle = signal(true);
  private readonly $loading = signal(false);
  private readonly $error = signal<FetchingError | null>(null);

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

  delete(projectId: number): Observable<any> {
    return this.http.delete(`${this.URL}/projects/${projectId}`);
  }

  update(projectId: number, name: string): Observable<Project> {
    return this.http.patch<Project>(`${this.URL}/projects/${projectId}`, {
      name,
    });
  }

  add(name: string): Observable<Project> {
    return this.http.post<Project>(`${this.URL}/projects`, { name });
  }

  getById(projectId: number): Observable<Project> {
    return this.http.get<Project>(`${this.URL}/projects/${projectId}`);
  }
}
