import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiPaginatedResponse } from '../../shared/defs/api-response.defs';
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

  public getAll(searchParams?: GetAllProjectsSearchParams): Observable<ApiPaginatedResponse<ProjectListItem>> {
    return this.httpService.getAll(searchParams).pipe(
      tap(response => {
        if (response) {
          this.state.setProjectList(response.items);
          this.state.setPagination(response.pagination);
        }
      }),
    );
  }

  public delete(projectId: string, version: number | null): Observable<void> {
    return this.httpService.delete(projectId, version).pipe(tap(() => this.state.removeProject(projectId)));
  }

  public update(projectId: string, payload: UpdateProjectPayload, version: number | null): Observable<Project> {
    return this.httpService
      .update(projectId, payload, version)
      .pipe(tap(response => this.state.updateProject(response)));
  }

  public add(payload: CreateProjectPayload): Observable<Project> {
    return this.httpService.add(payload).pipe(tap(response => this.state.addProject(response)));
  }

  public getProjectById(projectId: string): Observable<Project> {
    return this.httpService.getById(projectId);
  }

  public getProjectByIdWithDetails(projectId: string): Observable<ProjectDetails> {
    return this.httpService.getByIdWithDetails(projectId);
  }
}
