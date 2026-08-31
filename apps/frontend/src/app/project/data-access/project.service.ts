import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiPaginatedResponse, ApiResponse } from '../../shared/defs/api-response.defs';
import {
  CreateProjectPayload,
  GetAllProjectsSearchParams,
  Project,
  ProjectDetails,
  ProjectListItem,
  UpdateProjectPayload,
} from '../defs/project.defs';
import { ProjectsApiService } from './project.api.service';
import { ProjectsStateService } from './project.state.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly httpService = inject(ProjectsApiService);
  private readonly state = inject(ProjectsStateService);

  public getAll(
    searchParams?: GetAllProjectsSearchParams,
  ): Observable<ApiResponse<ApiPaginatedResponse<ProjectListItem>>> {
    return this.httpService.getAll(searchParams).pipe(
      tap(response => {
        if (response.data) {
          this.state.setProjectList(response.data.items);
          this.state.setPagination(response.data.pagination);
        }
      }),
    );
  }

  public delete(projectId: string, version: number | null): Observable<ApiResponse<void>> {
    return this.httpService.delete(projectId, version).pipe(tap(() => this.state.removeProject(projectId)));
  }

  public update(
    projectId: string,
    payload: UpdateProjectPayload,
    version: number | null,
  ): Observable<ApiResponse<Project>> {
    return this.httpService
      .update(projectId, payload, version)
      .pipe(tap(response => this.state.updateProject(response.data)));
  }

  public add(payload: CreateProjectPayload): Observable<ApiResponse<Project>> {
    return this.httpService.add(payload).pipe(tap(response => this.state.addProject(response.data)));
  }

  public getProjectById(projectId: string): Observable<ApiResponse<Project>> {
    return this.httpService.getById(projectId);
  }

  public getProjectByIdWithDetails(projectId: string): Observable<ApiResponse<ProjectDetails>> {
    return this.httpService.getByIdWithDetails(projectId);
  }
}
