import { Component, input, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBars3, heroSquares2x2 } from '@ng-icons/heroicons/outline';
import { TranslateModule } from '@ngx-translate/core';
import { TasksListViewMode } from '../../shared/types/task.type';

@Component({
  imports: [NgIconComponent, TranslateModule],
  viewProviders: [provideIcons({ heroSquares2x2, heroBars3 })],
  selector: 'app-tasks-list-view-mode',
  template: `
    <div class="flex gap-4 items-center my-4">
      <span>
        {{ 'Task.viewMode' | translate }}
        :</span
      >
      <button
        (click)="updateTasksListView.emit('list')"
        class="flex"
        [class.text-green-500]="$view() === 'list'"
      >
        <ng-icon name="heroBars3" />
      </button>
      <button
        (click)="updateTasksListView.emit('kanban')"
        class="flex"
        [class.text-green-500]="$view() === 'kanban'"
      >
        <ng-icon name="heroSquares2x2" />
      </button>
    </div>
  `,
})
export class TasksListViewModeComponent {
  public readonly $view = input<TasksListViewMode>('list');

  readonly updateTasksListView = output<TasksListViewMode>();
}
