import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { FetchingError } from 'src/app/shared/types/list-state.type';
import { environment } from 'src/environments/environment';
import { ApiPaginatedResponse, ApiResponse } from '../../shared/types/api-response.type';
import { GetAllTasksSearchParams } from '../../shared/types/task.type';
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

  public batchDelete(taskIds: number[]): Observable<ApiResponse<void>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<void>>(`${this.URL}/tasks/batch-delete`, { taskIds }),
    );
  }

  public addWithFiles(formData: FormData): Observable<ApiResponse<Task>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<Task>>(`${this.URL}/tasks`, formData),
    );
  }

  public getOne(taskId: number): Observable<ApiResponse<Task>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<Task>>(`${this.URL}/tasks/${taskId}`),
    );
  }

  public createCommentWithFiles(taskId: number, formData: FormData): Observable<ApiResponse<any>> {
    return this.withLoadingState(
      this.http.post<ApiResponse<any>>(`${this.URL}/tasks/${taskId}/comments`, formData),
    );
  }

  public deleteComment(commentId: number): Observable<ApiResponse<void>> {
    return this.withLoadingState(
      this.http.delete<ApiResponse<void>>(`${this.URL}/tasks/comments/${commentId}`),
    );
  }

  public updateCommentWithFiles(commentId: number, formData: FormData): Observable<ApiResponse<any>> {
    return this.withLoadingState(
      this.http.put<ApiResponse<any>>(`${this.URL}/tasks/comments/${commentId}`, formData),
    );
  }

  public updateWithFiles(taskId: number, formData: FormData): Observable<ApiResponse<Task>> {
    return this.withLoadingState(
      this.http.patch<ApiResponse<Task>>(`${this.URL}/tasks/${taskId}`, formData),
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
        return throwError(() => e);
      }),
      tap(() => {
        this.$loading.set(false);
      }),
    );
  }
}
