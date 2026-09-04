import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiPaginatedResponse } from '../../shared/defs/api-response.defs';
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
  public getAll(searchParams?: GetAllProjectsSearchParams): Observable<ApiPaginatedResponse<ProjectListItem>> {
    return this.withLoadingState(
      this.http.get<ApiPaginatedResponse<ProjectListItem>>(`${this.baseUrl}${PROJECTS}`, {
        params: { ...searchParams },
      }),
    );
  }

  public delete(projectId: string, version: number | null): Observable<void> {
    return this.withLoadingState(
      this.http.delete<void>(`${this.baseUrl}${PROJECTS}/${projectId}`, {
        headers: this.ifMatch(version),
      }),
    );
  }

  public update(projectId: string, payload: UpdateProjectPayload, version: number | null): Observable<Project> {
    return this.withLoadingState(
      this.http.put<Project>(`${this.baseUrl}${PROJECTS}/${projectId}`, payload, {
        headers: this.ifMatch(version),
      }),
    );
  }

  public add(payload: CreateProjectPayload): Observable<Project> {
    return this.withLoadingState(this.http.post<Project>(`${this.baseUrl}${PROJECTS}`, payload));
  }

  public getById(projectId: string): Observable<Project> {
    return this.withLoadingState(this.http.get<Project>(`${this.baseUrl}${PROJECTS}/${projectId}`));
  }

  public getByIdWithDetails(projectId: string): Observable<ProjectDetails> {
    return this.withLoadingState(this.http.get<ProjectDetails>(`${this.baseUrl}${PROJECTS}/${projectId}/details`));
  }

  public getProjectMembers(projectId: string): Observable<ProjectMember[]> {
    return this.withLoadingState(this.http.get<ProjectMember[]>(`${this.baseUrl}${PROJECTS}/${projectId}/users`));
  }

  public getMyProjectPermissions(projectId: string): Observable<ProjectRolePermissionEnum[]> {
    return this.http.get<ProjectRolePermissionEnum[]>(`${this.baseUrl}${PROJECTS}/${projectId}/users/me/permissions`);
  }

  public updateMemberRole(
    projectId: string,
    memberId: string,
    roleId: string,
    version: number | null,
  ): Observable<ProjectMember> {
    return this.http.put<ProjectMember>(
      `${this.baseUrl}${PROJECTS}/${projectId}/users/${memberId}`,
      { roleId },
      { headers: this.ifMatch(version) },
    );
  }

  public removeMember(projectId: string, memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${PROJECTS}/${projectId}/users/${memberId}`);
  }

  public invite(projectId: string, email: string, roleId: string | null): Observable<ProjectInvitation> {
    return this.http.post<ProjectInvitation>(`${this.baseUrl}${PROJECTS}/${projectId}/invitations`, {
      email,
      roleId,
    });
  }

  public getMyInvitations(): Observable<ProjectInvitation[]> {
    return this.withLoadingState(this.http.get<ProjectInvitation[]>(`${this.baseUrl}${PROJECTS}/invitations/me`));
  }

  public acceptInvitation(body: { invitationId: string }): Observable<void> {
    return this.withLoadingState(this.http.post<void>(`${this.baseUrl}${PROJECTS}/invitations/accept`, body));
  }

  public rejectInvitation(body: { invitationId: string }): Observable<void> {
    return this.withLoadingState(this.http.post<void>(`${this.baseUrl}${PROJECTS}/invitations/reject`, body));
  }
}
