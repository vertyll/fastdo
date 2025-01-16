import { Injectable, computed, inject, signal } from '@angular/core';
import { LIST_STATE_VALUE } from 'src/app/shared/types/list-state.type';
import { Task } from '../models/Task';
import { TasksApiService } from './task.api.service';

@Injectable({ providedIn: 'root' })
export class TasksStateService {
  private tasksSignal = signal<Task[]>([]);
  private readonly apiService = inject(TasksApiService);

  public tasks = computed(() => this.tasksSignal());
  public state = computed(() =>
    this.apiService.$idle()
      ? LIST_STATE_VALUE.IDLE
      : this.apiService.$loading()
      ? LIST_STATE_VALUE.LOADING
      : this.apiService.$error()
      ? LIST_STATE_VALUE.ERROR
      : LIST_STATE_VALUE.SUCCESS
  );
  public error = computed(() => this.apiService.$error());
  public urgentCount = computed(
    () => this.tasksSignal().filter(task => task.isUrgent).length,
  );

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
}
