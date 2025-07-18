import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { FetchingError } from 'src/app/shared/types/list-state.type';
import { environment } from 'src/environments/environment';
import { ApiPaginatedResponse, ApiResponse } from '../../shared/types/api-response.type';
import { User } from '../../shared/types/entities.type';
import { GetAllProjectsSearchParams } from '../../shared/types/project.type';
import { Project } from '../models/Project';

@Injectable({
  providedIn: 'root',
})
export class ProjectsApiService {
  private readonly URL = environment.backendUrl + '/api';
  private readonly http = inject(HttpClient);
  readonly $idle = signal(true);
  readonly $loading = signal(false);
  readonly $error = signal<FetchingError | null>(null);

  public getAll(searchParams?: GetAllProjectsSearchParams): Observable<ApiResponse<ApiPaginatedResponse<Project>>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<ApiPaginatedResponse<Project>>>(`${this.URL}/projects`, {
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

  public updateFull(
    projectId: number,
    formData: FormData,
  ): Observable<ApiResponse<Project>> {
    return this.withLoadingState(
      this.http.patch<ApiResponse<Project>>(`${this.URL}/projects/${projectId}`, formData),
    );
  }

  public add(
    formData: FormData,
  ): Observable<ApiResponse<Project>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<Project>>(`${this.URL}/projects`, formData),
    );
  }

  public getById(projectId: number): Observable<ApiResponse<Project>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<Project>>(`${this.URL}/projects/${projectId}`),
    );
  }

  public getByIdWithDetails(projectId: number, lang?: string): Observable<ApiResponse<Project>> {
    const params: { [key: string]: string; } = {};
    if (lang) {
      params['lang'] = lang;
    }
    return this.withLoadingState(
      this.http.get<ApiResponse<Project>>(`${this.URL}/projects/${projectId}/details`, { params }),
    );
  }

  public getProjectUsers(projectId: number): Observable<ApiResponse<User[]>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<User[]>>(`${this.URL}/projects/${projectId}/users`),
    );
  }

  public acceptInvitation(body: { invitationId: number; }) {
    return this.withLoadingState(
      this.http.post<ApiResponse<void>>(`${this.URL}/projects/invitations/accept`, body),
    );
  }

  public rejectInvitation(body: { invitationId: number; }) {
    return this.withLoadingState(
      this.http.post<ApiResponse<void>>(`${this.URL}/projects/invitations/reject`, body),
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
        return throwError(() => e);
      }),
      tap(() => {
        this.$loading.set(false);
      }),
    );
  }
}
