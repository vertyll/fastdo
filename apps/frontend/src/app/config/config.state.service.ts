import { Injectable, signal } from '@angular/core';
import { TasksListViewMode } from '../task/ui/task-list-view-mode.component';

type AppConfigState = {
  tasksListView: TasksListViewMode;
};

@Injectable({
  providedIn: 'root',
})
export class AppConfigStateService {
  private state = signal<AppConfigState>({
    tasksListView: 'list',
  });
  public readonly $value = this.state.asReadonly();

  public updateTasksListView(value: TasksListViewMode): void {
    this.state.update((state) => {
      return {
        ...state,
        tasksListView: value,
      };
    });
  }
}
