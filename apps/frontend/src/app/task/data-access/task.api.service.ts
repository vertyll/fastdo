import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiPaginatedResponse, ApiResponse } from '../../shared/defs/api-response.defs';
import { ProjectRolePermissionEnum } from '../../shared/enums/project-role-permission.enum';
import { HttpApiService } from '../../shared/services/http-api.service';
import {
  CreateCommentPayload,
  CreateTaskPayload,
  GetAllTasksSearchParams,
  Task,
  TaskComment,
  TaskDetails,
  TaskListItem,
  UpdateTaskPayload,
} from '../defs/task.defs';

const TASKS = '/tasks';

@Injectable({
  providedIn: 'root',
})
export class TasksApiService extends HttpApiService {
  public getAllByProjectId(
    projectId: string,
    searchParams: GetAllTasksSearchParams,
  ): Observable<ApiResponse<ApiPaginatedResponse<TaskListItem>>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<ApiPaginatedResponse<TaskListItem>>>(`${this.baseUrl}${TASKS}/project/${projectId}`, {
        params: { ...searchParams },
      }),
    );
  }

  public getOne(taskId: string): Observable<ApiResponse<TaskDetails>> {
    return this.withLoadingState(this.http.get<ApiResponse<TaskDetails>>(`${this.baseUrl}${TASKS}/${taskId}`));
  }

  public getPermissions(projectId: string): Observable<ApiResponse<ProjectRolePermissionEnum[]>> {
    return this.http.get<ApiResponse<ProjectRolePermissionEnum[]>>(
      `${this.baseUrl}${TASKS}/project/${projectId}/permissions`,
    );
  }

  public add(projectId: string, payload: CreateTaskPayload): Observable<ApiResponse<Task>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<Task>>(`${this.baseUrl}${TASKS}/project/${projectId}`, payload),
    );
  }

  public update(taskId: string, payload: UpdateTaskPayload, version: number | null): Observable<ApiResponse<Task>> {
    return this.withLoadingState(
      this.http.put<ApiResponse<Task>>(`${this.baseUrl}${TASKS}/${taskId}`, payload, {
        headers: this.ifMatch(version),
      }),
    );
  }

  public changeStatus(taskId: string, statusId: string | null, version: number | null): Observable<ApiResponse<Task>> {
    return this.withLoadingState(
      this.http.patch<ApiResponse<Task>>(
        `${this.baseUrl}${TASKS}/${taskId}/status`,
        { statusId },
        { headers: this.ifMatch(version) },
      ),
    );
  }

  public logWork(taskId: string, hundredthsOfHour: number): Observable<ApiResponse<Task>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<Task>>(`${this.baseUrl}${TASKS}/${taskId}/worklog`, { hundredthsOfHour }),
    );
  }

  public delete(taskId: string, version: number | null): Observable<ApiResponse<void>> {
    return this.withLoadingState(
      this.http.delete<ApiResponse<void>>(`${this.baseUrl}${TASKS}/${taskId}`, { headers: this.ifMatch(version) }),
    );
  }

  public batchDelete(taskIds: string[]): Observable<ApiResponse<number>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<number>>(`${this.baseUrl}${TASKS}/batch-delete`, { taskIds }),
    );
  }

  public getComments(taskId: string): Observable<ApiResponse<TaskComment[]>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<TaskComment[]>>(`${this.baseUrl}${TASKS}/${taskId}/comments`),
    );
  }

  public createComment(taskId: string, payload: CreateCommentPayload): Observable<ApiResponse<TaskComment>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<TaskComment>>(`${this.baseUrl}${TASKS}/${taskId}/comments`, payload),
    );
  }

  public updateComment(
    commentId: string,
    content: string,
    version: number | null,
  ): Observable<ApiResponse<TaskComment>> {
    return this.withLoadingState(
      this.http.put<ApiResponse<TaskComment>>(
        `${this.baseUrl}${TASKS}/comments/${commentId}`,
        { content },
        { headers: this.ifMatch(version) },
      ),
    );
  }

  public deleteComment(commentId: string): Observable<ApiResponse<void>> {
    return this.withLoadingState(this.http.delete<ApiResponse<void>>(`${this.baseUrl}${TASKS}/comments/${commentId}`));
  }
}
