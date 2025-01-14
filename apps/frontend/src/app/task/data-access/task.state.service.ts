import { Injectable, computed, signal } from '@angular/core';
import { Task } from '../models/Task';

@Injectable({ providedIn: 'root' })
export class TasksStateService {
  private tasksSignal = signal<Task[]>([]);

  public tasks = computed(() => this.tasksSignal());
  urgentCount = computed(
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
