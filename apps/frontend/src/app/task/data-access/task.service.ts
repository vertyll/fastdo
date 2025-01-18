import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AddTaskDto } from '../dtos/add-task.dto';
import { GetAllTasksSearchParams, TaskUpdatePayload, TasksApiService } from './task.api.service';
import { TasksStateService } from './task.state.service';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly httpService = inject(TasksApiService);
  private readonly state = inject(TasksStateService);

  public getAll(searchParams?: GetAllTasksSearchParams): Observable<any> {
    return this.httpService.getAll(searchParams).pipe(
      tap(response => {
        if (response.body.data) {
          this.state.setTaskList(response.body.data);
        }
      }),
    );
  }

  public getAllByProjectId(
    projectId: string,
    searchParams: GetAllTasksSearchParams,
  ): Observable<any> {
    return this.httpService.getAllByProjectId(projectId, searchParams).pipe(
      tap(response => {
        if (response.body.data) {
          this.state.setTaskList(response.body.data);
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
      tap(task => {
        this.state.updateTask(task);
      }),
    );
  }

  public add(data: AddTaskDto): Observable<any> {
    return this.httpService.add(data).pipe(
      tap(task => {
        this.state.addTask(task);
      }),
    );
  }
}
