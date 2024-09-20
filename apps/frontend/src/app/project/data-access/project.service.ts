import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { map, Observable, tap } from 'rxjs';
import { createListState } from 'src/app/utils/create-list-state';
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
  private readonly loadingState$ = toObservable(this.httpService.$loadingState);
  public state = inject(ProjectsStateService);

  listState$ = createListState(
    this.state.value$,
    this.loadingState$,
    (state) => state.projects,
  );

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
