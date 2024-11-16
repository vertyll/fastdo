import { Injectable, inject } from '@angular/core';
import {
  GetAllTasksSearchParams,
  TaskUpdatePayload,
  TasksApiService,
} from './task.api.service';
import { Observable, tap } from 'rxjs';
import { TasksStateService } from './task.state.service';
import { AddTaskDto } from '../dtos/add-task.dto';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly httpService = inject(TasksApiService);
  private readonly state = inject(TasksStateService);

  public getAll(searchParams?: GetAllTasksSearchParams): Observable<any> {
    return this.httpService.getAll(searchParams).pipe(
      tap((response) => {
        if (response.body) {
          this.state.setTaskList(response.body);
        }
      }),
    );
  }

  public getAllByProjectId(
    projectId: string,
    searchParams: GetAllTasksSearchParams,
  ): Observable<any> {
    return this.httpService.getAllByProjectId(projectId, searchParams).pipe(
      tap((response) => {
        if (response.body) {
          this.state.setTaskList(response.body);
        }
      }),
    );
  }

  public delete(taskId: number): Observable<any> {
    return this.httpService.delete(taskId).pipe(
      tap(() => {
        this.state.removeTask(taskId);
      }),
    );
  }

  public update(taskId: number, payload: TaskUpdatePayload): Observable<any> {
    return this.httpService.update(taskId, payload).pipe(
      tap((task) => {
        this.state.updateTask(task);
      }),
    );
  }

  public add(data: AddTaskDto): Observable<any> {
    return this.httpService.add(data).pipe(
      tap((task) => {
        this.state.addTask(task);
      }),
    );
  }
}
