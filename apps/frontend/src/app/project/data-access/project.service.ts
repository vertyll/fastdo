import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { map, tap } from 'rxjs';
import { createListState } from 'src/app/utils/create-list-state';
import {
  GetAllProjectsSearchParams,
  ProjectsApiService,
} from './projects.api.service';
import { ProjectsStateService } from './projects.state.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private httpService = inject(ProjectsApiService);
  public state = inject(ProjectsStateService);

  private loadingState$ = toObservable(this.httpService.$loadingState);

  listState$ = createListState(
    this.state.value$,
    this.loadingState$,
    (state) => state.projects,
  );

  getAll(searchParams?: GetAllProjectsSearchParams) {
    return this.httpService.getAll(searchParams).pipe(
      tap((response) => {
        if (response.body) {
          this.state.setProjectList(response.body);
        }
      }),
    );
  }

  delete(projectId: number) {
    return this.httpService.delete(projectId).pipe(
      tap(() => {
        this.state.removeProject(projectId);
      }),
    );
  }

  update(projectId: number, name: string) {
    return this.httpService.update(projectId, name).pipe(
      tap((project) => {
        this.state.updateProject(project);
      }),
    );
  }

  add(name: string) {
    return this.httpService.add(name).pipe(
      tap((project) => {
        this.state.addProject(project);
      }),
    );
  }
}
