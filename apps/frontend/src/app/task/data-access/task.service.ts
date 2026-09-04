import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { ApiPaginatedResponse } from '../../shared/defs/api-response.defs';
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
  WorkLogVisibility,
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
  ): Observable<ApiPaginatedResponse<TaskListItem>> {
    return this.httpService.getAllByProjectId(projectId, searchParams).pipe(
      tap(response => {
        if (response) {
          this.state.setTaskList(response.items);
          this.state.setPagination(response.pagination);
        }
      }),
    );
  }

  public loadMoreByProjectId(
    projectId: string,
    searchParams: GetAllTasksSearchParams,
  ): Observable<ApiPaginatedResponse<TaskListItem>> {
    this.state.setLoadingMore(true);
    return this.httpService.getAllByProjectId(projectId, searchParams).pipe(
      tap(response => {
        if (response) {
          this.state.appendTaskList(response.items);
          this.state.setPagination(response.pagination);
        }
        this.state.setLoadingMore(false);
      }),
      catchError((error: unknown) => {
        this.state.setLoadingMore(false);
        throw error;
      }),
    );
  }

  public getPermissions(projectId: string): Observable<ProjectRolePermissionEnum[]> {
    return this.httpService.getPermissions(projectId);
  }

  public delete(taskId: string, version: number | null): Observable<void> {
    return this.httpService.delete(taskId, version).pipe(tap(() => this.state.removeTask(taskId)));
  }

  public batchDelete(taskIds: string[]): Observable<number> {
    return this.httpService
      .batchDelete(taskIds)
      .pipe(tap(() => taskIds.forEach(taskId => this.state.removeTask(taskId))));
  }

  public add(projectId: string, payload: CreateTaskPayload): Observable<Task> {
    return this.httpService.add(projectId, payload);
  }

  public update(taskId: string, payload: UpdateTaskPayload, version: number | null): Observable<Task> {
    return this.httpService.update(taskId, payload, version);
  }

  public getWorkLog(
    taskId: string,
    page: number,
    size: number,
    visibility: WorkLogVisibility,
  ): Observable<WorkLogPage> {
    return this.httpService.getWorkLog(taskId, page, size, visibility);
  }

  public logWork(taskId: string, payload: WorkLogPayload): Observable<WorkLogEntry> {
    return this.httpService.logWork(taskId, payload);
  }

  public updateWorkLogEntry(
    entryId: string,
    payload: WorkLogPayload,
    version: number | null,
  ): Observable<WorkLogEntry> {
    return this.httpService.updateWorkLogEntry(entryId, payload, version);
  }

  public deleteWorkLogEntry(entryId: string): Observable<void> {
    return this.httpService.deleteWorkLogEntry(entryId);
  }

  public getOne(taskId: string): Observable<TaskDetails> {
    return this.httpService.getOne(taskId);
  }

  public createComment(taskId: string, payload: CreateCommentPayload): Observable<TaskComment> {
    return this.httpService.createComment(taskId, payload);
  }

  public updateComment(commentId: string, content: string, version: number | null): Observable<TaskComment> {
    return this.httpService.updateComment(commentId, content, version);
  }

  public deleteComment(commentId: string): Observable<void> {
    return this.httpService.deleteComment(commentId);
  }
}
