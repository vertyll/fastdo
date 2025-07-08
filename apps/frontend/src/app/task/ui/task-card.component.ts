import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBookmark, heroCalendar, heroCheck, heroEye, heroPencil } from '@ng-icons/heroicons/outline';
import { heroBookmarkSolid } from '@ng-icons/heroicons/solid';
import { TranslateModule } from '@ngx-translate/core';
import { AutosizeTextareaComponent } from 'src/app/shared/components/atoms/autosize-textarea.component';
import { RemoveItemButtonComponent } from 'src/app/shared/components/molecules/remove-item-button.component';
import { NotificationTypeEnum } from 'src/app/shared/enums/notification.enum';
import { CustomDatePipe } from 'src/app/shared/pipes/custom-date.pipe';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { TruncateTextPipe } from '../../shared/pipes/truncate-text.pipe';
import { TaskUpdatePayload } from '../../shared/types/task.type';
import { Task } from '../models/Task';
import { TaskNameValidator } from '../validators/task-name.validator';

@Component({
  selector: 'app-task-card',
  imports: [
    RemoveItemButtonComponent,
    CustomDatePipe,
    AutosizeTextareaComponent,
    NgIconComponent,
    RouterLink,
    TranslateModule,
    CommonModule,
    TruncateTextPipe,
  ],
  template: `
    <div
      class="rounded-md border border-border-primary dark:border-dark-border-primary shadow-sm hover:shadow-md p-4 block w-full transition-colors duration-200 dark:bg-dark-surface-primary"
    >
      <button
        class="w-full text-left"
        (click)="!editMode && handleSingleClick()"
      >
        <header class="flex justify-end">
          <div class="flex gap-1 items-start">
            <button
              class="p-2 rounded-md transition-all duration-200 text-text-primary dark:text-dark-text-primary flex items-center justify-center hover:scale-125"
              [routerLink]="['/projects', task().project?.id, 'tasks', 'details', task().id]"
              (click)="$event.stopPropagation()"
            >
              <ng-icon name="heroEye" size="18"/>
            </button>
            <app-remove-item-button (confirm)="delete.emit()"/>
            @if (!editMode) {
              <button
                class="md:hidden p-2 rounded-md transition-all duration-200 text-text-primary dark:text-dark-text-primary flex items-center justify-center hover:scale-125"
                (click)="switchToEditMode(); $event.stopPropagation()"
              >
                <ng-icon name="heroPencil" size="18"/>
              </button>
            } @else {
              <button
                class="md:hidden p-2 rounded-md transition-all duration-200 text-text-primary dark:text-dark-text-primary flex items-center justify-center hover:scale-125"
                (click)="saveTaskName(); $event.stopPropagation()"
              >
                <ng-icon name="heroCheck" size="18"/>
              </button>
            }
          </div>
        </header>

        <section class="text-left break-all">
          @if (editMode) {
            <app-autosize-textarea
              #autosizeTextarea
              (keyup.escape)="editMode = false"
              (submitText)="updateTaskName($event)"
              [value]="task().description"
            />
          } @else {
            <span
              class="hidden md:block w-full cursor-pointer"
              (click)="toggleExpanded(); $event.stopPropagation()"
              (dblclick)="switchToEditMode()"
            >
              {{ task().description | truncateText:150:isExpanded }}
            </span>
            <span
              class="md:hidden block w-full cursor-pointer"
              (click)="toggleExpanded(); $event.stopPropagation()"
            >
              {{ task().description | truncateText:150:isExpanded }}
            </span>
          }
        </section>

        <section class="text-left text-sm mt-2 break-all">
          @if ((task().project?.name ?? '').length > 150) {
            <button
              class="ml-1 text-xs text-text-muted hover:text-text-secondary dark:text-dark-text-muted dark:hover:text-dark-text-secondary"
              (click)="toggleProjectExpanded(); $event.stopPropagation()"
            >
              {{ isProjectExpanded ? '[show less]' : '[...]' }}
            </button>
          }
        </section>

        <footer class="pt-2 flex justify-end">
          <div class="flex flex-col items-end text-xs">
            <div class="flex items-center">
              <span class="pr-1">
                {{ 'Task.created' | translate }}
                : {{ task().dateCreation | customDate }}</span
              >
              <ng-icon name="heroCalendar" class="text-sm"/>
            </div>
            <div class="flex items-center">
              <span class="pr-1">
                {{ 'Task.modified' | translate }} : {{ (task().dateModification | customDate) || '-' }}</span
              >
              <ng-icon name="heroCalendar" class="text-sm"/>
            </div>
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
  viewProviders: [
    provideIcons({
      heroBookmark,
      heroBookmarkSolid,
      heroCalendar,
      heroPencil,
      heroCheck,
      heroEye,
    }),
  ],
})
export class TaskCardComponent {
  readonly task = input.required<Task>();
  readonly update = output<TaskUpdatePayload>();
  readonly delete = output<void>();

  @ViewChild('autosizeTextarea')
  autosizeTextarea!: AutosizeTextareaComponent;

  protected readonly notificationService = inject(NotificationService);
  protected readonly taskNameValidator = inject(TaskNameValidator);
  protected editMode: boolean = false;
  protected isExpanded: boolean = false;
  protected isProjectExpanded: boolean = false;
  private isSingleClick: boolean = true;

  protected toggleExpanded(): void {
    if (this.task().description.length > 150) {
      this.isExpanded = !this.isExpanded;
    }
  }

  protected toggleProjectExpanded(): void {
    if ((this.task().project?.name ?? '').length > 150) {
      this.isProjectExpanded = !this.isProjectExpanded;
    }
  }

  protected updateTaskName(updatedDescription: string): void {
    const validation = this.taskNameValidator.validateTaskName(updatedDescription);
    if (!validation.isValid) {
      this.notificationService.showNotification(
        validation.error!,
        NotificationTypeEnum.Error,
      );
      return;
    }

    this.update.emit({ description: updatedDescription });
    this.editMode = false;
  }

  protected handleSingleClick(): void {
    this.isSingleClick = true;
  }

  protected switchToEditMode(): void {
    this.isSingleClick = false;
    this.editMode = true;
  }

  protected saveTaskName(): void {
    this.autosizeTextarea.submit();
  }
}
