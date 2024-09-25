import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  GetAllProjectsSearchParams,
  ProjectsApiService,
} from './project.api.service';
import { ProjectsStateService } from './project.state.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly httpService = inject(ProjectsApiService);
  private readonly state = inject(ProjectsStateService);

  public getAll(searchParams?: GetAllProjectsSearchParams): Observable<any> {
    return this.httpService.getAll(searchParams).pipe(
      tap((response) => {
        if (response.body) {
          this.state.setProjectList(response.body);
        }
      }),
    );
  }

  public delete(projectId: number): Observable<any> {
    return this.httpService.delete(projectId).pipe(
      tap(() => {
        this.state.removeProject(projectId);
      }),
    );
  }

  public update(projectId: number, name: string): Observable<any> {
    return this.httpService.update(projectId, name).pipe(
      tap((project) => {
        this.state.updateProject(project);
      }),
    );
  }

  public add(name: string): Observable<any> {
    return this.httpService.add(name).pipe(
      tap((project) => {
        this.state.addProject(project);
      }),
    );
  }

  public getProjectById(projectId: number): Observable<any> {
    return this.httpService.getById(projectId);
  }
}
