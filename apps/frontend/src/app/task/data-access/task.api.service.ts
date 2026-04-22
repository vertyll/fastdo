import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiPaginatedResponse, ApiResponse } from '../../shared/types/api-response.type';
import { GetAllTasksSearchParams } from '../../shared/types/task.type';
import { Task } from '../models/Task';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class TasksApiService extends HttpApiService {
  public getAllByProjectId(
    projectId: string,
    searchParams: GetAllTasksSearchParams,
  ): Observable<ApiResponse<ApiPaginatedResponse<Task>>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<ApiPaginatedResponse<Task>>>(`${this.baseUrl}/tasks/project/${projectId}`, {
        params: searchParams,
      }),
    );
  }

  public delete(taskId: number): Observable<ApiResponse<void>> {
    return this.withLoadingState(this.http.delete<ApiResponse<void>>(`${this.baseUrl}/tasks/${taskId}`));
  }

  public batchDelete(taskIds: number[]): Observable<ApiResponse<void>> {
    return this.withLoadingState(this.http.post<ApiResponse<void>>(`${this.baseUrl}/tasks/batch-delete`, { taskIds }));
  }

  public addWithFiles(formData: FormData): Observable<ApiResponse<Task>> {
    return this.withLoadingState(this.http.post<ApiResponse<Task>>(`${this.baseUrl}/tasks`, formData));
  }

  public getOne(taskId: number): Observable<ApiResponse<Task>> {
    return this.withLoadingState(this.http.get<ApiResponse<Task>>(`${this.baseUrl}/tasks/${taskId}`));
  }

  public createCommentWithFiles(taskId: number, formData: FormData): Observable<ApiResponse<any>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<any>>(`${this.baseUrl}/tasks/${taskId}/comments`, formData),
    );
  }

  public deleteComment(commentId: number): Observable<ApiResponse<void>> {
    return this.withLoadingState(this.http.delete<ApiResponse<void>>(`${this.baseUrl}/tasks/comments/${commentId}`));
  }

  public updateCommentWithFiles(commentId: number, formData: FormData): Observable<ApiResponse<any>> {
    return this.withLoadingState(
      this.http.put<ApiResponse<any>>(`${this.baseUrl}/tasks/comments/${commentId}`, formData),
    );
  }

  public updateWithFiles(taskId: number, formData: FormData): Observable<ApiResponse<Task>> {
    return this.withLoadingState(this.http.patch<ApiResponse<Task>>(`${this.baseUrl}/tasks/${taskId}`, formData));
  }
}
