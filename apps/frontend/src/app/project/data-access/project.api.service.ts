import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiPaginatedResponse, ApiResponse } from '../../shared/types/api-response.type';
import { User } from '../../shared/types/entities.type';
import { GetAllProjectsSearchParams, Project } from '../defs/project.defs';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectsApiService extends HttpApiService {
  public getAll(searchParams?: GetAllProjectsSearchParams): Observable<ApiResponse<ApiPaginatedResponse<Project>>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<ApiPaginatedResponse<Project>>>(`${this.baseUrl}/projects`, {
        params: searchParams,
      }),
    );
  }

  public delete(projectId: number): Observable<ApiResponse<void>> {
    return this.withLoadingState(this.http.delete<ApiResponse<void>>(`${this.baseUrl}/projects/${projectId}`));
  }

  public update(projectId: number, name: string): Observable<ApiResponse<Project>> {
    return this.withLoadingState(
      this.http.patch<ApiResponse<Project>>(`${this.baseUrl}/projects/${projectId}`, { name }),
    );
  }

  public updateFull(projectId: number, formData: FormData): Observable<ApiResponse<Project>> {
    return this.withLoadingState(
      this.http.patch<ApiResponse<Project>>(`${this.baseUrl}/projects/${projectId}`, formData),
    );
  }

  public add(formData: FormData): Observable<ApiResponse<Project>> {
    return this.withLoadingState(this.http.post<ApiResponse<Project>>(`${this.baseUrl}/projects`, formData));
  }

  public getById(projectId: number): Observable<ApiResponse<Project>> {
    return this.withLoadingState(this.http.get<ApiResponse<Project>>(`${this.baseUrl}/projects/${projectId}`));
  }

  public getByIdWithDetails(projectId: number, lang?: string): Observable<ApiResponse<Project>> {
    const params: { [key: string]: string } = {};
    if (lang) {
      params['lang'] = lang;
    }
    return this.withLoadingState(
      this.http.get<ApiResponse<Project>>(`${this.baseUrl}/projects/${projectId}/details`, { params }),
    );
  }

  public getProjectUsers(projectId: number): Observable<ApiResponse<User[]>> {
    return this.withLoadingState(this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/projects/${projectId}/users`));
  }

  public acceptInvitation(body: { invitationId: number }): Observable<ApiResponse<void>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<void>>(`${this.baseUrl}/projects/invitations/accept`, body),
    );
  }

  public rejectInvitation(body: { invitationId: number }): Observable<ApiResponse<void>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<void>>(`${this.baseUrl}/projects/invitations/reject`, body),
    );
  }
}
