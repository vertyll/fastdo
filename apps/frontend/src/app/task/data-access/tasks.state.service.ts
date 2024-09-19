import { Injectable } from '@angular/core';
import { Task } from '../model/Task';
import { BehaviorSubject } from 'rxjs';

const initialState = {
  tasks: [] as Task[],
  urgentCount: 0,
};

@Injectable({ providedIn: 'root' })
export class TasksStateService {
  private readonly state$ = new BehaviorSubject(initialState);
  public value$ = this.state$.asObservable();

  setTaskList(tasks: Task[]): void {
    this.state$.next({
      tasks,
      urgentCount: tasks.filter((task) => task.isUrgent).length,
    });
  }

  addTask(task: Task): void {
    const updatedTasks = [...this.state$.value.tasks, task];
    const updatedUrgentCount = updatedTasks.filter((t) => t.isUrgent).length;

    this.state$.next({
      tasks: updatedTasks,
      urgentCount: updatedUrgentCount,
    });
  }

  updateTask(updatedTask: Task): void {
    const updatedTasks = this.state$.value.tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task,
    );
    const updatedUrgentCount = updatedTasks.filter((t) => t.isUrgent).length;

    this.state$.next({
      tasks: updatedTasks,
      urgentCount: updatedUrgentCount,
    });
  }

  removeTask(taskId: Task['id']): void {
    const updatedTasks = this.state$.value.tasks.filter((task) => {
      return task.id !== taskId;
    });

    this.state$.next({
      tasks: updatedTasks,
      urgentCount: updatedTasks.filter((task) => task.isUrgent).length,
    });
  }
}
