import { Injectable, computed, inject, signal } from '@angular/core';
import { LOADING_STATE_VALUE } from 'src/app/shared/types/list-state.type';
import { PaginationMeta } from '../../shared/types/api-response.type';
import { Task } from '../models/Task';
import { TasksApiService } from './task.api.service';

@Injectable({ providedIn: 'root' })
export class TasksStateService {
  private readonly apiService = inject(TasksApiService);

  private readonly tasksSignal = signal<Task[]>([]);
  private readonly paginationSignal = signal<PaginationMeta>({
    total: 0,
    page: 0,
    pageSize: 10,
    totalPages: 0,
  });
  private readonly hasMoreSignal = signal(true);
  private readonly isLoadingMoreSignal = signal(false);

  public tasks = computed(() => this.tasksSignal());
  public state = computed(() => {
    if (this.apiService.$idle()) {
      return LOADING_STATE_VALUE.IDLE;
    } else if (this.apiService.$loading()) {
      return LOADING_STATE_VALUE.LOADING;
    } else if (this.apiService.$error()) {
      return LOADING_STATE_VALUE.ERROR;
    } else {
      return LOADING_STATE_VALUE.SUCCESS;
    }
  });
  public error = computed(() => this.apiService.$error());
  public readonly pagination = this.paginationSignal.asReadonly();
  public readonly hasMore = this.hasMoreSignal.asReadonly();
  public readonly isLoadingMore = this.isLoadingMoreSignal.asReadonly();

  public setTaskList(tasks: Task[]): void {
    this.tasksSignal.set(tasks);
  }

  public appendTaskList(tasks: Task[]): void {
    this.tasksSignal.update(currentTasks => [...currentTasks, ...tasks]);
  }

  public addTask(task: Task): void {
    this.tasksSignal.update(tasks => [...tasks, task]);
  }

  public updateTask(updatedTask: Task): void {
    this.tasksSignal.update(tasks => tasks.map(task => (task.id === updatedTask.id ? updatedTask : task)));
  }

  public removeTask(taskId: Task['id']): void {
    this.tasksSignal.update(tasks => tasks.filter(task => task.id !== taskId));
  }

  public setPagination(pagination: PaginationMeta): void {
    this.paginationSignal.set(pagination);
    // Use hasMore from API if available, otherwise fallback to page calculation
    const hasMore = pagination.hasMore ?? pagination.page < pagination.totalPages - 1;
    this.hasMoreSignal.set(hasMore);
  }

  public setLoadingMore(loading: boolean): void {
    this.isLoadingMoreSignal.set(loading);
  }

  public resetState(): void {
    this.tasksSignal.set([]);
    this.paginationSignal.set({
      total: 0,
      page: 0,
      pageSize: 10,
      totalPages: 0,
    });
    this.hasMoreSignal.set(true);
    this.isLoadingMoreSignal.set(false);
  }
}
