import { Component, inject, input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationType } from 'src/app/shared/enums/notification.enum';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { TaskUpdatePayload } from '../data-access/task.api.service';
import { TasksService } from '../data-access/task.service';
import { Task } from '../models/Task';
import { TaskCardComponent } from './task-card.component';

@Component({
  selector: 'app-tasks-list',
  imports: [TaskCardComponent, TranslateModule],
  template: `
    <ul>
      @for (task of tasks(); track task.id) {
        <li class="mb-4">
          <app-task-card
            [task]="task"
            (update)="updateTask(task.id, $event)"
            (delete)="delete(task.id)"
          />
        </li>
      } @empty {
        <p>
          {{ 'Task.emptyList' | translate }}
        </p>
      }
    </ul>
  `,
  styles: [],
})
export class TasksListComponent {
  readonly tasks = input.required<Task[]>();

  private readonly tasksService = inject(TasksService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);

  protected delete(taskId: number): void {
    this.tasksService.delete(taskId).subscribe({
      next: () => {},
      error: err => {
        if (err.error && err.error.message) {
          this.notificationService.showNotification(
            err.error.message,
            NotificationType.error,
          );
        } else {
          this.notificationService.showNotification(
            this.translateService.instant('Task.deleteError'),
            NotificationType.error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          this.translateService.instant('Task.deleteSuccess'),
          NotificationType.success,
        );
      },
    });
  }

  protected updateTask(taskId: number, updatedTask: TaskUpdatePayload): void {
    this.tasksService.update(taskId, updatedTask).subscribe({
      next: () => {},
      error: res => {
        if (res.error && res.error.message) {
          this.notificationService.showNotification(
            res.error.message,
            NotificationType.error,
          );
        } else {
          this.notificationService.showNotification(
            this.translateService.instant('Task.updateError'),
            NotificationType.error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          this.translateService.instant('Task.updateSuccess'),
          NotificationType.success,
        );
      },
    });
  }
}
