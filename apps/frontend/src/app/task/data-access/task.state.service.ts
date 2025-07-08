import { Injectable, computed, inject, signal } from '@angular/core';
import { LOADING_STATE_VALUE } from 'src/app/shared/types/list-state.type';
import { PaginationMeta } from '../../shared/types/api-response.type';
import { Task } from '../models/Task';
import { TasksApiService } from './task.api.service';

@Injectable({ providedIn: 'root' })
export class TasksStateService {
  private readonly apiService = inject(TasksApiService);

  private tasksSignal = signal<Task[]>([]);
  private readonly paginationSignal = signal<PaginationMeta>({
    total: 0,
    page: 0,
    pageSize: 10,
    totalPages: 0,
  });

  public tasks = computed(() => this.tasksSignal());
  public state = computed(() =>
    this.apiService.$idle()
      ? LOADING_STATE_VALUE.IDLE
      : this.apiService.$loading()
      ? LOADING_STATE_VALUE.LOADING
      : this.apiService.$error()
      ? LOADING_STATE_VALUE.ERROR
      : LOADING_STATE_VALUE.SUCCESS
  );
  public error = computed(() => this.apiService.$error());

  public readonly pagination = this.paginationSignal.asReadonly();

  public setTaskList(tasks: Task[]): void {
    this.tasksSignal.set(tasks);
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
  }
}
