import { Injectable, inject, effect, computed } from '@angular/core';
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

  projects = this.state.projects;
  projectCount = this.state.projectCount;

  listState = computed(() => ({
    items: this.projects(),
    loading: this.httpService.$loadingState().loading,
  }));

  getAll(searchParams?: GetAllProjectsSearchParams): Observable<any> {
    return this.httpService.getAll(searchParams).pipe(
      tap((response) => {
        if (response.body) {
          this.state.setProjectList(response.body);
        }
      }),
    );
  }

  delete(projectId: number): Observable<any> {
    return this.httpService.delete(projectId).pipe(
      tap(() => {
        this.state.removeProject(projectId);
      }),
    );
  }

  update(projectId: number, name: string): Observable<any> {
    return this.httpService.update(projectId, name).pipe(
      tap((project) => {
        this.state.updateProject(project);
      }),
    );
  }

  add(name: string): Observable<any> {
    return this.httpService.add(name).pipe(
      tap((project) => {
        this.state.addProject(project);
      }),
    );
  }

  getProjectById(projectId: number): Observable<any> {
    return this.httpService.getById(projectId);
  }
}
