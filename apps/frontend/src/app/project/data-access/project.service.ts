import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../../shared/interfaces/api-response.interface';
import { Project } from '../models/Project';
import { GetAllProjectsSearchParams, ProjectsApiService } from './project.api.service';
import { ProjectsStateService } from './project.state.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly httpService = inject(ProjectsApiService);
  private readonly state = inject(ProjectsStateService);

  public getAll(searchParams?: GetAllProjectsSearchParams): Observable<ApiResponse<Project[]>> {
    return this.httpService.getAll(searchParams).pipe(
      tap(response => {
        if (response.data) {
          this.state.setProjectList(response.data);
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

  public add(name: string): Observable<ApiResponse<Project>> {
    return this.httpService.add(name).pipe(
      tap(response => {
        this.state.addProject(response.data);
      }),
    );
  }

  public getProjectById(projectId: number): Observable<ApiResponse<Project>> {
    return this.httpService.getById(projectId);
  }
}
