import { Component, Input, inject } from '@angular/core';
import { Task } from '../models/Task';
import { RemoveItemButtonComponent } from 'src/app/shared/components/remove-item-button.component';
import { TaskCardComponent } from './task-card.component';
import { TaskUpdatePayload } from '../data-access/task.api.service';
import { TasksService } from '../data-access/task.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NotificationType } from 'src/app/shared/enums/notification.enum';
import { AutosizeTextareaComponent } from 'src/app/shared/components/autosize-textarea.component';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [
    RemoveItemButtonComponent,
    AutosizeTextareaComponent,
    TaskCardComponent,
  ],
  template: `
    <ul>
      @for (task of tasks; track task.id) {
        <li class="mb-2">
          <app-task-card
            [task]="task"
            (update)="updateTask(task.id, $event)"
            (delete)="delete(task.id)"
          />
        </li>
      } @empty {
        <p>No tasks</p>
      }
    </ul>
  `,
  styles: [],
})
export class TasksListComponent {
  @Input({ required: true }) tasks: Task[] = [];

  private readonly tasksService = inject(TasksService);
  private readonly notificationService = inject(NotificationService);

  protected delete(taskId: number): void {
    this.tasksService.delete(taskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((task) => task.id !== taskId);
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.notificationService.showNotification(
            err.error.message,
            NotificationType.error,
          );
        } else {
          this.notificationService.showNotification(
            'An error occurred while deleting the task',
            NotificationType.error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          'Task deleted successfully',
          NotificationType.success,
        );
      },
    });
  }

  protected updateTask(taskId: number, updatedTask: TaskUpdatePayload): void {
    this.tasksService.update(taskId, updatedTask).subscribe({
      next: (res) => {
        this.tasks = this.tasks.map((task) => {
          if (task.id === res.id) {
            return res;
          } else {
            return task;
          }
        });
      },
      error: (res) => {
        if (res.error && res.error.message) {
          this.notificationService.showNotification(
            res.error.message,
            NotificationType.error,
          );
        } else {
          this.notificationService.showNotification(
            'An error occurred while updating the task',
            NotificationType.error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          'Task updated successfully',
          NotificationType.success,
        );
      },
    });
  }
}
