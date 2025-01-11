import {Injectable, signal, inject} from '@angular/core';
import {TasksListViewMode} from '../task/ui/task-list-view-mode.component';
import {LocalStorageService} from '../shared/services/local-storage.service';

const TASKS_VIEW_MODE_KEY = 'tasksViewMode';

type AppConfigState = {
  tasksListView: TasksListViewMode;
};

@Injectable({
  providedIn: 'root',
})
export class AppConfigStateService {
  private readonly localStorageService = inject(LocalStorageService);

  private state = signal<AppConfigState>({
    tasksListView: this.localStorageService.get<TasksListViewMode>(TASKS_VIEW_MODE_KEY, 'list'),
  });

  public readonly $value = this.state.asReadonly();

  public updateTasksListView(value: TasksListViewMode): void {
    this.state.update((state) => {
      this.localStorageService.set(TASKS_VIEW_MODE_KEY, value);
      return {
        ...state,
        tasksListView: value,
      };
    });
  }
}
