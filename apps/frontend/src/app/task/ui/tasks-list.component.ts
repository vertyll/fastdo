import { Component, Input, inject } from '@angular/core';
import { Task } from '../model/Task';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherCalendar } from '@ng-icons/feather-icons';
import { AutosizeTextareaComponent } from '@ui/autosize-textarea.component';
import { RemoveItemButtonComponent } from '@ui/remove-item-button.component';
import { TaskCardComponent } from './task-card.component';
import { TaskUpdatePayload } from '../data-access/tasks.api.service';
import { TasksService } from '../data-access/tasks.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NotificationType } from 'src/app/shared/enums/notification.enum';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  viewProviders: [provideIcons({ featherCalendar })],
  imports: [
    NgIconComponent,
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

  private tasksService = inject(TasksService);
  private notificationService = inject(NotificationService);

  delete(taskId: number) {
    this.tasksService.delete(taskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((task) => task.id !== taskId);
      },
      error: (res) => {
        alert(res.message);
      },
    });
  }

  updateTask(taskId: number, updatedTask: TaskUpdatePayload) {
    this.tasksService.update(taskId, updatedTask).subscribe({
      next: (res) => {
        this.tasks = this.tasks.map((task) => {
          if (task.id === res.id) {
            return res;
          } else {
            return task;
          }
        });

        this.notificationService.showNotification(
          'Task updated successfully',
          NotificationType.success,
        );
      },
      error: (res) => {
        alert(res.message);
      },
    });
  }
}
