import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiPaginatedResponse } from '../../shared/defs/api-response.defs';
import { ProjectRolePermissionEnum } from '../../shared/enums/project-role-permission.enum';
import { HttpApiService } from '../../shared/services/http-api.service';
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

const TASKS = '/tasks';

@Injectable({
  providedIn: 'root',
})
export class TasksApiService extends HttpApiService {
  public getAllByProjectId(
    projectId: string,
    searchParams: GetAllTasksSearchParams,
  ): Observable<ApiPaginatedResponse<TaskListItem>> {
    return this.withLoadingState(
      this.http.get<ApiPaginatedResponse<TaskListItem>>(`${this.baseUrl}${TASKS}/project/${projectId}`, {
        params: { ...searchParams },
      }),
    );
  }

  public getOne(taskId: string): Observable<TaskDetails> {
    return this.withLoadingState(this.http.get<TaskDetails>(`${this.baseUrl}${TASKS}/${taskId}`));
  }

  public getPermissions(projectId: string): Observable<ProjectRolePermissionEnum[]> {
    return this.http.get<ProjectRolePermissionEnum[]>(`${this.baseUrl}${TASKS}/project/${projectId}/permissions`);
  }

  public add(projectId: string, payload: CreateTaskPayload): Observable<Task> {
    return this.withLoadingState(this.http.post<Task>(`${this.baseUrl}${TASKS}/project/${projectId}`, payload));
  }

  public update(taskId: string, payload: UpdateTaskPayload, version: number | null): Observable<Task> {
    return this.withLoadingState(
      this.http.put<Task>(`${this.baseUrl}${TASKS}/${taskId}`, payload, {
        headers: this.ifMatch(version),
      }),
    );
  }

  public changeStatus(taskId: string, statusId: string | null, version: number | null): Observable<Task> {
    return this.withLoadingState(
      this.http.patch<Task>(
        `${this.baseUrl}${TASKS}/${taskId}/status`,
        { statusId },
        { headers: this.ifMatch(version) },
      ),
    );
  }

  public delete(taskId: string, version: number | null): Observable<void> {
    return this.withLoadingState(
      this.http.delete<void>(`${this.baseUrl}${TASKS}/${taskId}`, { headers: this.ifMatch(version) }),
    );
  }

  public batchDelete(taskIds: string[]): Observable<number> {
    return this.withLoadingState(this.http.post<number>(`${this.baseUrl}${TASKS}/batch-delete`, { taskIds }));
  }

  public getComments(taskId: string): Observable<TaskComment[]> {
    return this.withLoadingState(this.http.get<TaskComment[]>(`${this.baseUrl}${TASKS}/${taskId}/comments`));
  }

  public createComment(taskId: string, payload: CreateCommentPayload): Observable<TaskComment> {
    return this.withLoadingState(this.http.post<TaskComment>(`${this.baseUrl}${TASKS}/${taskId}/comments`, payload));
  }

  public updateComment(commentId: string, content: string, version: number | null): Observable<TaskComment> {
    return this.withLoadingState(
      this.http.put<TaskComment>(
        `${this.baseUrl}${TASKS}/comments/${commentId}`,
        { content },
        { headers: this.ifMatch(version) },
      ),
    );
  }

  public getWorkLog(
    taskId: string,
    page: number,
    size: number,
    visibility: WorkLogVisibility,
  ): Observable<WorkLogPage> {
    const params = new HttpParams().set('page', page).set('size', size).set('visibility', visibility);
    return this.withLoadingState(this.http.get<WorkLogPage>(`${this.baseUrl}${TASKS}/${taskId}/worklog`, { params }));
  }

  public logWork(taskId: string, payload: WorkLogPayload): Observable<WorkLogEntry> {
    return this.withLoadingState(this.http.post<WorkLogEntry>(`${this.baseUrl}${TASKS}/${taskId}/worklog`, payload));
  }

  public updateWorkLogEntry(
    entryId: string,
    payload: WorkLogPayload,
    version: number | null,
  ): Observable<WorkLogEntry> {
    return this.withLoadingState(
      this.http.put<WorkLogEntry>(`${this.baseUrl}${TASKS}/worklog/${entryId}`, payload, {
        headers: this.ifMatch(version),
      }),
    );
  }

  public deleteWorkLogEntry(entryId: string): Observable<void> {
    return this.withLoadingState(this.http.delete<void>(`${this.baseUrl}${TASKS}/worklog/${entryId}`));
  }

  public deleteComment(commentId: string): Observable<void> {
    return this.withLoadingState(this.http.delete<void>(`${this.baseUrl}${TASKS}/comments/${commentId}`));
  }
}
