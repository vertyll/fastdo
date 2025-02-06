import { Component, effect, inject, input, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBars3, heroSquares2x2 } from '@ng-icons/heroicons/outline';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from 'src/app/shared/services/platform.service';
import { TasksListViewMode } from '../../shared/types/task.type';

@Component({
  imports: [NgIconComponent, TranslateModule],
  viewProviders: [provideIcons({ heroSquares2x2, heroBars3 })],
  selector: 'app-tasks-list-view-mode',
  template: `
    @if (!isMobile()) {
      <div class="flex gap-4 items-center">
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
    }
  `,
})
export class TasksListViewModeComponent {
  public readonly $view = input<TasksListViewMode>('list');
  readonly updateTasksListView = output<TasksListViewMode>();

  private readonly platformService = inject(PlatformService);
  protected readonly isMobile = this.platformService.isMobile;

  constructor() {
    effect(() => {
      if (this.isMobile()) {
        this.updateTasksListView.emit('list');
      }
    });
  }
}
