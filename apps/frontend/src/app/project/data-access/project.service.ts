import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiPaginatedResponse, ApiResponse } from '../../shared/types/api-response.type';
import { GetAllProjectsSearchParams } from '../../shared/types/project.type';
import { Project } from '../models/Project';
import { ProjectsApiService } from './project.api.service';
import { ProjectsStateService } from './project.state.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly httpService = inject(ProjectsApiService);
  private readonly state = inject(ProjectsStateService);

  public getAll(searchParams?: GetAllProjectsSearchParams): Observable<ApiResponse<ApiPaginatedResponse<Project>>> {
    return this.httpService.getAll(searchParams).pipe(
      tap(response => {
        if (response.data) {
          this.state.setProjectList(response.data.items);
          this.state.setPagination(response.data.pagination);
        }
      }),
    );
  }

  public delete(projectId: number): Observable<ApiResponse<void>> {
    return this.httpService.delete(projectId).pipe(
      tap(() => {
        this.state.removeProject(projectId);
      }),
    );
  }

  public update(projectId: number, name: string): Observable<ApiResponse<Project>> {
    return this.httpService.update(projectId, name).pipe(
      tap(response => {
        this.state.updateProject(response.data);
      }),
    );
  }

  public updateFull(projectId: number, formData: FormData): Observable<ApiResponse<Project>> {
    return this.httpService.updateFull(projectId, formData).pipe(
      tap(response => {
        this.state.updateProject(response.data);
      }),
    );
  }

  public add(formData: FormData): Observable<ApiResponse<Project>> {
    return this.httpService.add(formData).pipe(
      tap(response => {
        this.state.addProject(response.data);
      }),
    );
  }

  public getProjectById(projectId: number): Observable<ApiResponse<Project>> {
    return this.httpService.getById(projectId);
  }

  public getProjectByIdWithDetails(projectId: number, lang?: string): Observable<ApiResponse<Project>> {
    return this.httpService.getByIdWithDetails(projectId, lang);
  }
}
