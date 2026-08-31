import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiPaginatedResponse, ApiResponse } from '../../shared/defs/api-response.defs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { ProjectRolePermissionEnum } from '../../shared/enums/project-role-permission.enum';
import {
  CreateProjectPayload,
  GetAllProjectsSearchParams,
  Project,
  ProjectDetails,
  ProjectInvitation,
  ProjectListItem,
  ProjectMember,
  UpdateProjectPayload,
} from '../defs/project.defs';

const PROJECTS = '/projects';

@Injectable({
  providedIn: 'root',
})
export class ProjectsApiService extends HttpApiService {
  public getAll(
    searchParams?: GetAllProjectsSearchParams,
  ): Observable<ApiResponse<ApiPaginatedResponse<ProjectListItem>>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<ApiPaginatedResponse<ProjectListItem>>>(`${this.baseUrl}${PROJECTS}`, {
        params: { ...searchParams },
      }),
    );
  }

  public delete(projectId: string, version: number | null): Observable<ApiResponse<void>> {
    return this.withLoadingState(
      this.http.delete<ApiResponse<void>>(`${this.baseUrl}${PROJECTS}/${projectId}`, {
        headers: this.ifMatch(version),
      }),
    );
  }

  public update(
    projectId: string,
    payload: UpdateProjectPayload,
    version: number | null,
  ): Observable<ApiResponse<Project>> {
    return this.withLoadingState(
      this.http.put<ApiResponse<Project>>(`${this.baseUrl}${PROJECTS}/${projectId}`, payload, {
        headers: this.ifMatch(version),
      }),
    );
  }

  public add(payload: CreateProjectPayload): Observable<ApiResponse<Project>> {
    return this.withLoadingState(this.http.post<ApiResponse<Project>>(`${this.baseUrl}${PROJECTS}`, payload));
  }

  public getById(projectId: string): Observable<ApiResponse<Project>> {
    return this.withLoadingState(this.http.get<ApiResponse<Project>>(`${this.baseUrl}${PROJECTS}/${projectId}`));
  }

  public getByIdWithDetails(projectId: string): Observable<ApiResponse<ProjectDetails>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<ProjectDetails>>(`${this.baseUrl}${PROJECTS}/${projectId}/details`),
    );
  }

  public getProjectMembers(projectId: string): Observable<ApiResponse<ProjectMember[]>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<ProjectMember[]>>(`${this.baseUrl}${PROJECTS}/${projectId}/users`),
    );
  }

  public getMyProjectPermissions(projectId: string): Observable<ApiResponse<ProjectRolePermissionEnum[]>> {
    return this.http.get<ApiResponse<ProjectRolePermissionEnum[]>>(
      `${this.baseUrl}${PROJECTS}/${projectId}/users/me/permissions`,
    );
  }

  public updateMemberRole(
    projectId: string,
    memberId: string,
    roleId: string,
    version: number | null,
  ): Observable<ApiResponse<ProjectMember>> {
    return this.http.put<ApiResponse<ProjectMember>>(
      `${this.baseUrl}${PROJECTS}/${projectId}/users/${memberId}`,
      { roleId },
      { headers: this.ifMatch(version) },
    );
  }

  public removeMember(projectId: string, memberId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}${PROJECTS}/${projectId}/users/${memberId}`);
  }

  public invite(projectId: string, email: string, roleId: string | null): Observable<ApiResponse<ProjectInvitation>> {
    return this.http.post<ApiResponse<ProjectInvitation>>(`${this.baseUrl}${PROJECTS}/${projectId}/invitations`, {
      email,
      roleId,
    });
  }

  public getMyInvitations(): Observable<ApiResponse<ProjectInvitation[]>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<ProjectInvitation[]>>(`${this.baseUrl}${PROJECTS}/invitations/me`),
    );
  }

  public acceptInvitation(body: { invitationId: string }): Observable<ApiResponse<void>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<void>>(`${this.baseUrl}${PROJECTS}/invitations/accept`, body),
    );
  }

  public rejectInvitation(body: { invitationId: string }): Observable<ApiResponse<void>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<void>>(`${this.baseUrl}${PROJECTS}/invitations/reject`, body),
    );
  }
}
