import { Injectable, inject, signal } from '@angular/core';
import { TASKS_VIEW_MODE_STORAGE_KEY } from '../app.contansts';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { AppConfigState } from '../shared/types/config.type';
import { TasksListViewMode } from '../shared/types/task.type';

@Injectable({
  providedIn: 'root',
})
export class AppConfigStateService {
  private readonly localStorageService = inject(LocalStorageService);

  private state = signal<AppConfigState>({
    tasksListView: this.localStorageService.get<TasksListViewMode>(TASKS_VIEW_MODE_STORAGE_KEY, 'list'),
  });

  public readonly $value = this.state.asReadonly();

  public updateTasksListView(value: TasksListViewMode): void {
    this.state.update(state => {
      this.localStorageService.set(TASKS_VIEW_MODE_STORAGE_KEY, value);
      return {
        ...state,
        tasksListView: value,
      };
    });
  }
}
