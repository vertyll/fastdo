import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { FetchingError } from 'src/app/shared/types/list-state.type';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../shared/interfaces/api-response.interface';
import { Project } from '../models/Project';

export type GetAllProjectsSearchParams = {
  q: string;
  sortBy: 'dateCreation' | 'name';
  orderBy: 'desc' | 'asc';
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ProjectsApiService {
  private readonly URL = environment.backendUrl;
  private readonly http = inject(HttpClient);

  readonly $idle = signal(true);
  readonly $loading = signal(false);
  readonly $error = signal<FetchingError | null>(null);

  public getAll(searchParams?: GetAllProjectsSearchParams): Observable<ApiResponse<Project[]>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<Project[]>>(`${this.URL}/projects`, {
        params: searchParams,
      }),
    );
  }

  public delete(projectId: number): Observable<ApiResponse<void>> {
    return this.withLoadingState(
      this.http.delete<ApiResponse<void>>(`${this.URL}/projects/${projectId}`),
    );
  }

  public update(projectId: number, name: string): Observable<ApiResponse<Project>> {
    return this.withLoadingState(
      this.http.patch<ApiResponse<Project>>(`${this.URL}/projects/${projectId}`, { name }),
    );
  }

  public add(name: string): Observable<ApiResponse<Project>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<Project>>(`${this.URL}/projects`, { name }),
    );
  }

  public getById(projectId: number): Observable<ApiResponse<Project>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<Project>>(`${this.URL}/projects/${projectId}`),
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
