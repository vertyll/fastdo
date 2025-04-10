import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiPaginatedResponse, ApiResponse } from '../../shared/types/api-response.type';
import { GetAllTasksSearchParams, TaskUpdatePayload } from '../../shared/types/task.type';
import { AddTaskDto } from '../dtos/add-task.dto';
import { Task } from '../models/Task';
import { TasksApiService } from './task.api.service';
import { TasksStateService } from './task.state.service';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly httpService = inject(TasksApiService);
  private readonly state = inject(TasksStateService);

  public getAll(searchParams?: GetAllTasksSearchParams): Observable<ApiResponse<ApiPaginatedResponse<Task>>> {
    return this.httpService.getAll(searchParams).pipe(
      tap(response => {
        if (response.data) {
          this.state.setTaskList(response.data.items);
          this.state.setPagination(response.data.pagination);
        }
      }),
    );
  }

  public getAllByProjectId(
    projectId: string,
    searchParams: GetAllTasksSearchParams,
  ): Observable<ApiResponse<ApiPaginatedResponse<Task>>> {
    return this.httpService.getAllByProjectId(projectId, searchParams).pipe(
      tap(response => {
        if (response.data) {
          this.state.setTaskList(response.data.items);
          this.state.setPagination(response.data.pagination);
        }
      }),
    );
  }

  public delete(taskId: number): Observable<ApiResponse<void>> {
    return this.httpService.delete(taskId).pipe(
      tap(() => {
        this.state.removeTask(taskId);
      }),
    );
  }

  public update(taskId: number, payload: TaskUpdatePayload): Observable<ApiResponse<Task>> {
    return this.httpService.update(taskId, payload).pipe(
      tap(response => {
        this.state.updateTask(response.data);
      }),
    );
  }

  public add(data: AddTaskDto): Observable<ApiResponse<Task>> {
    return this.httpService.add(data).pipe(
      tap(response => {
        this.state.addTask(response.data);
      }),
    );
  }
}
