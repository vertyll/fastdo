import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { FetchingError } from 'src/app/shared/types/list-state.type';
import { environment } from 'src/environments/environment';
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

  private readonly $idle = signal(true);
  private readonly $loading = signal(false);
  private readonly $error = signal<FetchingError | null>(null);

  public getAll(searchParams?: GetAllProjectsSearchParams) {
    return this.withLoadingState(
      this.http.get<Project[]>(`${this.URL}/projects`, {
        observe: 'response',
        params: searchParams,
      }),
    );
  }

  public delete(projectId: number): Observable<any> {
    return this.http.delete(`${this.URL}/projects/${projectId}`);
  }

  public update(projectId: number, name: string): Observable<Project> {
    return this.http.patch<Project>(`${this.URL}/projects/${projectId}`, {
      name,
    });
  }

  public add(name: string): Observable<Project> {
    return this.http.post<Project>(`${this.URL}/projects`, { name });
  }

  public getById(projectId: number): Observable<Project> {
    return this.http.get<Project>(`${this.URL}/projects/${projectId}`);
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
