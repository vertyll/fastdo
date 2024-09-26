import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Task } from '../models/Task';
import { RemoveItemButtonComponent } from 'src/app/shared/components/remove-item-button.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { CustomDatePipe } from 'src/app/shared/pipes/custom-date.pipe';
import { heroBookmark } from '@ng-icons/heroicons/outline';
import { heroBookmarkSolid } from '@ng-icons/heroicons/solid';
import { TaskUpdatePayload } from '../data-access/task.api.service';
import { RouterLink } from '@angular/router';
import { AutosizeTextareaComponent } from 'src/app/shared/components/autosize-textarea.component';
import { validateTaskName } from '../validators/task-name.validator';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NotificationType } from 'src/app/shared/enums/notification.enum';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    RemoveItemButtonComponent,
    CustomDatePipe,
    AutosizeTextareaComponent,
    NgIconComponent,
    RouterLink,
  ],
  template: `
    <div
      class="rounded-md shadow-md p-4 block w-full"
      [class.bg-green-300]="task.isDone"
    >
      <button
        class="w-full text-left"
        (click)="!editMode && handleSingleClick()"
        (dblclick)="switchToEditMode()"
      >
        <header class="flex justify-end">
          <app-remove-item-button (confirm)="delete.emit()" />
        </header>
        <section class="text-left break-all">
          @if (editMode) {
            <app-autosize-textarea
              (keyup.escape)="editMode = false"
              (submitText)="updateTaskName($event)"
              [value]="task.name"
            />
          } @else {
            <span [class.line-through]="task.isDone" class="block w-full">
              {{ task.name }}
            </span>
          }
        </section>
        @if (task.project) {
          <section class="text-left text-sm mt-2 break-all">
            <span>For project: </span>
            <a
              [routerLink]="['/tasks', task.project.id]"
              class="text-blue-500 hover:underline"
            >
              {{ task.project.name }}
            </a>
          </section>
        }
        <footer class="pt-2 flex justify-between">
          <button
            class="flex items-center"
            (click)="updateTaskUrgentStatus(); $event.stopPropagation()"
          >
            <ng-icon
              [name]="task.isUrgent ? 'heroBookmarkSolid' : 'heroBookmark'"
              class="text-sm"
            />
          </button>
          <div class="flex flex-col items-end text-xs">
            <div class="flex items-center">
              <span class="pr-1"
                >Created: {{ task.dateCreation | customDate }}</span
              >
              <ng-icon name="heroCalendar" class="text-sm" />
            </div>
            @if (task.dateModification) {
              <div class="flex items-center">
                <span class="pr-1"
                  >Updated: {{ task.dateModification | customDate }}</span
                >
                <ng-icon name="heroCalendar" class="text-sm" />
              </div>
            }
          </div>
        </footer>
      </button>
    </div>
  `,
  styles: [`
    .break-all {
      word-break: break-all;
    }
  `],
  viewProviders: [provideIcons({ heroBookmark, heroBookmarkSolid })],
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() update = new EventEmitter<TaskUpdatePayload>();
  @Output() delete = new EventEmitter<void>();

  protected readonly notificationService = inject(NotificationService);
  protected editMode: boolean = false;
  private isSingleClick: boolean = true;

  protected updateTaskUrgentStatus(): void {
    this.update.emit({ isUrgent: !this.task.isUrgent });
  }

  protected updateTaskName(updatedName: string): void {
    const validation = validateTaskName(updatedName);
    if (!validation.isValid) {
      this.notificationService.showNotification(
        validation.error!,
        NotificationType.error,
      );
      return;
    }

    this.update.emit({ name: updatedName });

    this.editMode = false;
  }

  protected handleSingleClick(): void {
    this.isSingleClick = true;

    setTimeout(() => {
      if (this.isSingleClick) {
        this.update.emit({ isDone: !this.task.isDone });
      }
    }, 200);
  }

  protected switchToEditMode(): void {
    this.isSingleClick = false;
    this.editMode = true;
  }
}
