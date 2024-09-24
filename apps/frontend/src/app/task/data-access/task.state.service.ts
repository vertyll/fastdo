import { Injectable, signal, computed } from '@angular/core';
import { Task } from '../model/Task';

@Injectable({ providedIn: 'root' })
export class TasksStateService {
  private tasksSignal = signal<Task[]>([]);

  tasks = computed(() => this.tasksSignal());
  urgentCount = computed(
    () => this.tasksSignal().filter((task) => task.isUrgent).length,
  );

  setTaskList(tasks: Task[]): void {
    this.tasksSignal.set(tasks);
  }

  addTask(task: Task): void {
    this.tasksSignal.update((tasks) => [...tasks, task]);
  }

  updateTask(updatedTask: Task): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    );
  }

  removeTask(taskId: Task['id']): void {
    this.tasksSignal.update((tasks) =>
      tasks.filter((task) => task.id !== taskId),
    );
  }
}
