import { Component, EventEmitter, Output, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroSquares2x2, heroBars3 } from '@ng-icons/heroicons/outline';
import { TranslateModule } from '@ngx-translate/core';

export type TasksListViewMode = 'kanban' | 'list';

@Component({
  standalone: true,
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

  @Output() updateTasksListView = new EventEmitter<TasksListViewMode>();
}
