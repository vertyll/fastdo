import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
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

  public getAll(searchParams: GetAllTasksSearchParams): Observable<ApiResponse<ApiPaginatedResponse<Task>>> {
    return this.httpService.getAll(searchParams).pipe(
      tap(response => {
        if (response.data) {
          this.state.setTaskList(response.data.items);
          this.state.setPagination(response.data.pagination);
        }
      }),
    );
  }

  public loadMore(searchParams: GetAllTasksSearchParams): Observable<ApiResponse<ApiPaginatedResponse<Task>>> {
    this.state.setLoadingMore(true);
    return this.httpService.getAll(searchParams).pipe(
      tap(response => {
        if (response.data) {
          this.state.appendTaskList(response.data.items);
          this.state.setPagination(response.data.pagination);
        }
        this.state.setLoadingMore(false);
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

  public loadMoreByProjectId(
    projectId: string,
    searchParams: GetAllTasksSearchParams,
  ): Observable<ApiResponse<ApiPaginatedResponse<Task>>> {
    this.state.setLoadingMore(true);
    return this.httpService.getAllByProjectId(projectId, searchParams).pipe(
      tap(response => {
        if (response.data) {
          this.state.appendTaskList(response.data.items);
          this.state.setPagination(response.data.pagination);
        }
        this.state.setLoadingMore(false);
      }),
      catchError((error: any) => {
        this.state.setLoadingMore(false);
        throw error;
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

  public batchDelete(taskIds: number[]): Observable<ApiResponse<void>> {
    return this.httpService.batchDelete(taskIds).pipe(
      tap(() => {
        taskIds.forEach(taskId => {
          this.state.removeTask(taskId);
        });
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

  public addWithFiles(formData: FormData): Observable<ApiResponse<Task>> {
    return this.httpService.addWithFiles(formData).pipe(
      tap(response => {
        this.state.addTask(response.data);
      }),
    );
  }

  public updateWithFiles(taskId: number, formData: FormData): Observable<ApiResponse<Task>> {
    return this.httpService.updateWithFiles(taskId, formData).pipe(
      tap(response => {
        this.state.updateTask(response.data);
      }),
    );
  }

  public getOne(taskId: number): Observable<ApiResponse<Task>> {
    return this.httpService.getOne(taskId);
  }

  public remove(taskId: number): Observable<ApiResponse<void>> {
    return this.delete(taskId);
  }

  public createComment(taskId: number, content: { content: string; }): Observable<ApiResponse<any>> {
    return this.httpService.createComment(taskId, content);
  }

  public deleteComment(commentId: number): Observable<ApiResponse<void>> {
    return this.httpService.deleteComment(commentId);
  }

  public updateComment(commentId: number, content: { content: string; }): Observable<ApiResponse<any>> {
    return this.httpService.updateComment(commentId, content);
  }

  public createCommentWithFiles(taskId: number, formData: FormData): Observable<ApiResponse<any>> {
    return this.httpService.createCommentWithFiles(taskId, formData);
  }

  public updateCommentWithFiles(commentId: number, formData: FormData): Observable<ApiResponse<any>> {
    return this.httpService.updateCommentWithFiles(commentId, formData);
  }
}
