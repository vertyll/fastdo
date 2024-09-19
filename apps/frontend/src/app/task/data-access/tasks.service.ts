import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  GetAllTasksSearchParams,
  TaskUpdatePayload,
  TasksApiService,
} from './tasks.api.service';
import { Observable, tap } from 'rxjs';
import { TasksStateService } from './tasks.state.service';
import { createListState } from 'src/app/utils/create-list-state';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly httpService = inject(TasksApiService);
  private readonly loadingState$ = toObservable(this.httpService.$loadingState);
  public readonly state = inject(TasksStateService);

  listState$ = createListState(
    this.state.value$,
    this.loadingState$,
    (state) => state.tasks,
  );

  getAll(searchParams?: GetAllTasksSearchParams): Observable<any> {
    return this.httpService.getAll(searchParams).pipe(
      tap((response) => {
        if (response.body) {
          this.state.setTaskList(response.body);
        }
      }),
    );
  }

  getAllByProjectId(projectId: string, searchParams: GetAllTasksSearchParams): Observable<any> {
    return this.httpService.getAllByProjectId(projectId, searchParams).pipe(
      tap((response) => {
        if (response.body) {
          this.state.setTaskList(response.body);
        }
      }),
    );
  }

  delete(taskId: number): Observable<any> {
    return this.httpService.delete(taskId).pipe(
      tap(() => {
        this.state.removeTask(taskId);
      }),
    );
  }

  update(taskId: number, payload: TaskUpdatePayload): Observable<any> {
    return this.httpService.update(taskId, payload).pipe(
      tap((task) => {
        this.state.updateTask(task);
      }),
    );
  }

  add(name: string, projectId?: string): Observable<any> {
    return this.httpService.add(name, projectId).pipe(
      tap((task) => {
        this.state.addTask(task);
      }),
    );
  }
}
