import { Injectable, inject, signal } from '@angular/core';
import { Task } from '../models/Task';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FetchingError } from 'src/app/shared/types/list-state.type';
import { AddTaskDto } from '../dtos/add-task.dto';

export type TaskUpdatePayload = {
  isDone?: boolean;
  name?: string;
  isUrgent?: boolean;
};

export type LoadingState = {
  idle: boolean;
  loading: boolean;
  error: FetchingError | null;
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
  private readonly $idle = signal(true);
  private readonly $loading = signal(false);
  private readonly $error = signal<FetchingError | null>(null);

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
    return this.http.delete(`${this.URL}/tasks/${taskId}`);
  }

  public update(taskId: number, payload: TaskUpdatePayload): Observable<Task> {
    return this.http.patch<Task>(`${this.URL}/tasks/${taskId}`, payload);
  }

  public add(data: AddTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.URL}/tasks`, data);
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
