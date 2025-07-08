import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { FetchingError } from 'src/app/shared/types/list-state.type';
import { environment } from 'src/environments/environment';
import { ApiPaginatedResponse, ApiResponse } from '../../shared/types/api-response.type';
import { GetAllTasksSearchParams, TaskUpdatePayload } from '../../shared/types/task.type';
import { AddTaskDto } from '../dtos/add-task.dto';
import { Task } from '../models/Task';

@Injectable({
  providedIn: 'root',
})
export class TasksApiService {
  private readonly URL = environment.backendUrl + '/api';
  private readonly http = inject(HttpClient);
  readonly $idle = signal(true);
  readonly $loading = signal(false);
  readonly $error = signal<FetchingError | null>(null);

  public getAllByProjectId(
    projectId: string,
    searchParams: GetAllTasksSearchParams,
  ): Observable<ApiResponse<ApiPaginatedResponse<Task>>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<ApiPaginatedResponse<Task>>>(`${this.URL}/tasks/project/${projectId}`, {
        params: searchParams,
      }),
    );
  }

  public delete(taskId: number): Observable<ApiResponse<void>> {
    return this.withLoadingState(
      this.http.delete<ApiResponse<void>>(`${this.URL}/tasks/${taskId}`),
    );
  }

  public update(taskId: number, payload: TaskUpdatePayload): Observable<ApiResponse<Task>> {
    return this.withLoadingState(
      this.http.patch<ApiResponse<Task>>(`${this.URL}/tasks/${taskId}`, payload),
    );
  }

  public add(data: AddTaskDto): Observable<ApiResponse<Task>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<Task>>(`${this.URL}/tasks`, data),
    );
  }

  public getOne(taskId: number): Observable<ApiResponse<Task>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<Task>>(`${this.URL}/tasks/${taskId}`),
    );
  }

  public createComment(taskId: number, content: { content: string; }): Observable<ApiResponse<any>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<any>>(`${this.URL}/tasks/${taskId}/comments`, content),
    );
  }

  public getTaskComments(taskId: number): Observable<ApiResponse<any[]>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<any[]>>(`${this.URL}/tasks/${taskId}/comments`),
    );
  }

  public deleteComment(commentId: number): Observable<ApiResponse<void>> {
    return this.withLoadingState(
      this.http.delete<ApiResponse<void>>(`${this.URL}/tasks/comments/${commentId}`),
    );
  }

  public updateComment(commentId: number, content: { content: string; }): Observable<ApiResponse<any>> {
    return this.withLoadingState(
      this.http.put<ApiResponse<any>>(`${this.URL}/tasks/comments/${commentId}`, content),
    );
  }

  private withLoadingState<T>(source$: Observable<T>): Observable<T> {
    this.$idle.set(false);
    this.$error.set(null);
    this.$loading.set(true);

    return source$.pipe(
      catchError((e: HttpErrorResponse) => {
        this.$error.set({ message: e.message, status: e.status });
        this.$loading.set(false);
        return EMPTY;
      }),
      tap(() => {
        this.$loading.set(false);
      }),
    );
  }
}
