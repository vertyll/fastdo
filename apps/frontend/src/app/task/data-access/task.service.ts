import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { ApiPaginatedResponse, ApiResponse } from '../../shared/defs/api-response.defs';
import { ProjectRolePermissionEnum } from '../../shared/enums/project-role-permission.enum';
import {
  CreateCommentPayload,
  CreateTaskPayload,
  GetAllTasksSearchParams,
  Task,
  TaskComment,
  WorkLogEntry,
  WorkLogPayload,
  TaskDetails,
  TaskListItem,
  UpdateTaskPayload,
  WorkLogPage,
} from '../defs/task.defs';
import { TasksApiService } from './task.api.service';
import { TasksStateService } from './task.state.service';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly httpService = inject(TasksApiService);
  private readonly state = inject(TasksStateService);

  public getAllByProjectId(
    projectId: string,
    searchParams: GetAllTasksSearchParams,
  ): Observable<ApiResponse<ApiPaginatedResponse<TaskListItem>>> {
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
  ): Observable<ApiResponse<ApiPaginatedResponse<TaskListItem>>> {
    this.state.setLoadingMore(true);
    return this.httpService.getAllByProjectId(projectId, searchParams).pipe(
      tap(response => {
        if (response.data) {
          this.state.appendTaskList(response.data.items);
          this.state.setPagination(response.data.pagination);
        }
        this.state.setLoadingMore(false);
      }),
      catchError((error: unknown) => {
        this.state.setLoadingMore(false);
        throw error;
      }),
    );
  }

  public getPermissions(projectId: string): Observable<ApiResponse<ProjectRolePermissionEnum[]>> {
    return this.httpService.getPermissions(projectId);
  }

  public delete(taskId: string, version: number | null): Observable<ApiResponse<void>> {
    return this.httpService.delete(taskId, version).pipe(tap(() => this.state.removeTask(taskId)));
  }

  public batchDelete(taskIds: string[]): Observable<ApiResponse<number>> {
    return this.httpService
      .batchDelete(taskIds)
      .pipe(tap(() => taskIds.forEach(taskId => this.state.removeTask(taskId))));
  }

  public add(projectId: string, payload: CreateTaskPayload): Observable<ApiResponse<Task>> {
    return this.httpService.add(projectId, payload);
  }

  public update(taskId: string, payload: UpdateTaskPayload, version: number | null): Observable<ApiResponse<Task>> {
    return this.httpService.update(taskId, payload, version);
  }

  public changeStatus(taskId: string, statusId: string | null, version: number | null): Observable<ApiResponse<Task>> {
    return this.httpService.changeStatus(taskId, statusId, version);
  }

  public getWorkLog(
    taskId: string,
    page: number,
    size: number,
    hidden?: boolean,
  ): Observable<ApiResponse<WorkLogPage>> {
    return this.httpService.getWorkLog(taskId, page, size, hidden);
  }

  public logWork(taskId: string, payload: WorkLogPayload): Observable<ApiResponse<WorkLogEntry>> {
    return this.httpService.logWork(taskId, payload);
  }

  public updateWorkLogEntry(
    entryId: string,
    payload: WorkLogPayload,
    version: number | null,
  ): Observable<ApiResponse<WorkLogEntry>> {
    return this.httpService.updateWorkLogEntry(entryId, payload, version);
  }

  public deleteWorkLogEntry(entryId: string): Observable<ApiResponse<void>> {
    return this.httpService.deleteWorkLogEntry(entryId);
  }

  public getOne(taskId: string): Observable<ApiResponse<TaskDetails>> {
    return this.httpService.getOne(taskId);
  }

  public getComments(taskId: string): Observable<ApiResponse<TaskComment[]>> {
    return this.httpService.getComments(taskId);
  }

  public createComment(taskId: string, payload: CreateCommentPayload): Observable<ApiResponse<TaskComment>> {
    return this.httpService.createComment(taskId, payload);
  }

  public updateComment(
    commentId: string,
    content: string,
    version: number | null,
  ): Observable<ApiResponse<TaskComment>> {
    return this.httpService.updateComment(commentId, content, version);
  }

  public deleteComment(commentId: string): Observable<ApiResponse<void>> {
    return this.httpService.deleteComment(commentId);
  }
}
