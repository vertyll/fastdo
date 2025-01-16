import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { FetchingError } from 'src/app/shared/types/list-state.type';
import { environment } from 'src/environments/environment';
import { AddTaskDto } from '../dtos/add-task.dto';
import { Task } from '../models/Task';

export type TaskUpdatePayload = {
  isDone?: boolean;
  name?: string;
  isUrgent?: boolean;
};

export type GetAllTasksSearchParams = {
  q: string;
  sortBy: 'dateCreation';
  orderBy: 'desc' | 'asc';
  is_done?: 'true' | 'false' | '';
  is_urgent?: 'true' | '';
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
};

@Injectable({
  providedIn: 'root',
})
export class TasksApiService {
  private readonly URL = environment.backendUrl;
  private readonly http = inject(HttpClient);
  readonly $idle = signal(true);
  readonly $loading = signal(false);
  readonly $error = signal<FetchingError | null>(null);

  public getAll(searchParams?: GetAllTasksSearchParams): Observable<any> {
    return this.withLoadingState(
      this.http.get<Task[]>(`${this.URL}/tasks`, {
        observe: 'response',
        params: searchParams,
      }),
    );
  }

  public getAllByProjectId(
    projectId: string,
    searchParams: GetAllTasksSearchParams,
  ): Observable<any> {
    return this.withLoadingState(
      this.http.get<Task[]>(`${this.URL}/tasks/project/${projectId}`, {
        observe: 'response',
        params: searchParams,
      }),
    );
  }

  public delete(taskId: number): Observable<any> {
    return this.withLoadingState(
      this.http.delete(`${this.URL}/tasks/${taskId}`),
    );
  }

  public update(taskId: number, payload: TaskUpdatePayload): Observable<Task> {
    return this.withLoadingState(
      this.http.patch<Task>(`${this.URL}/tasks/${taskId}`, payload),
    );
  }

  public add(data: AddTaskDto): Observable<Task> {
    return this.withLoadingState(
      this.http.post<Task>(`${this.URL}/tasks`, data),
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
