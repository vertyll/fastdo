import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { FetchingError } from 'src/app/shared/types/list-state.type';
import { SimpleUser } from 'src/app/shared/types/simple-entities.type';
import { environment } from 'src/environments/environment';
import { ApiPaginatedResponse, ApiResponse } from '../../shared/types/api-response.type';
import { GetAllProjectsSearchParams } from '../../shared/types/project.type';
import { AddProjectDto } from '../dtos/add-project.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';
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
    projectData: UpdateProjectDto,
    iconFile?: File | null,
  ): Observable<ApiResponse<Project>> {
    const formData = new FormData();

    if (projectData.name) formData.append('name', projectData.name);
    if (projectData.description) formData.append('description', projectData.description);
    if (projectData.isPublic !== undefined) formData.append('isPublic', projectData.isPublic.toString());
    if (projectData.typeId) formData.append('typeId', projectData.typeId.toString());
    if (projectData.isActive !== undefined) formData.append('isActive', projectData.isActive.toString());

    if (projectData.categories) {
      projectData.categories.forEach(category => formData.append('categories', category));
    }
    if (projectData.statuses) {
      projectData.statuses.forEach(status => formData.append('statuses', status));
    }

    if (projectData.userEmails) {
      projectData.userEmails.forEach(email => formData.append('userEmails', email));
    }

    if (projectData.usersWithRoles) {
      formData.append('usersWithRoles', JSON.stringify(projectData.usersWithRoles));
    }

    if (iconFile) {
      formData.append('icon', iconFile);
    }

    return this.withLoadingState(
      this.http.patch<ApiResponse<Project>>(`${this.URL}/projects/${projectId}`, formData),
    );
  }

  public add(projectData: AddProjectDto, iconFile?: File | null): Observable<ApiResponse<Project>> {
    const formData = new FormData();

    formData.append('name', projectData.name);
    if (projectData.description) formData.append('description', projectData.description);
    if (projectData.isPublic !== undefined) formData.append('isPublic', projectData.isPublic.toString());
    if (projectData.typeId) formData.append('typeId', projectData.typeId.toString());

    if (projectData.categories) {
      projectData.categories.forEach(category => formData.append('categories', category));
    }
    if (projectData.statuses) {
      projectData.statuses.forEach(status => formData.append('statuses', status));
    }

    if (projectData.userEmails) {
      projectData.userEmails.forEach(email => formData.append('userEmails', email));
    }

    if (projectData.usersWithRoles) {
      formData.append('usersWithRoles', JSON.stringify(projectData.usersWithRoles));
    }

    if (iconFile) {
      formData.append('icon', iconFile);
    }

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

  public getProjectUsers(projectId: number): Observable<ApiResponse<SimpleUser[]>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<SimpleUser[]>>(`${this.URL}/projects/${projectId}/users`),
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
        return EMPTY;
      }),
      tap(() => {
        this.$loading.set(false);
      }),
    );
  }
}
