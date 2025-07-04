import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBookmark, heroCalendar, heroCheck, heroPencil } from '@ng-icons/heroicons/outline';
import { heroBookmarkSolid } from '@ng-icons/heroicons/solid';
import { TranslateModule } from '@ngx-translate/core';
import { AutosizeTextareaComponent } from 'src/app/shared/components/atoms/autosize-textarea.component';
import { RemoveItemButtonComponent } from 'src/app/shared/components/molecules/remove-item-button.component';
import { NotificationTypeEnum } from 'src/app/shared/enums/notification.enum';
import { CustomDatePipe } from 'src/app/shared/pipes/custom-date.pipe';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { LinkComponent } from '../../shared/components/atoms/link.component';
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
    LinkComponent,
    CommonModule,
    TruncateTextPipe,
  ],
  template: `
    <div
      class="rounded-md border border-border-primary dark:border-dark-border-primary shadow-sm hover:shadow-md p-4 block w-full transition-colors duration-200"
      [ngClass]="{
        'bg-success-300 dark:bg-success-800': task().isDone,
        'dark:bg-dark-surface-primary': !task().isDone
      }"
    >
      <button
        class="w-full text-left"
        (click)="!editMode && handleSingleClick()"
      >
        <header class="flex justify-between gap-2">
          <div [ngClass]="{
            'bg-success-200 text-success-800': task().isPrivate,
            'bg-danger-200 text-danger-800': !task().isPrivate
          }" class="rounded-full px-2 text-xs font-bold h-6 flex items-center justify-center whitespace-nowrap">
            {{ task().isPrivate ? ('Task.private' | translate) : ('Task.public' | translate) }}
          </div>
          <div class="flex gap-2 items-start">
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
              [value]="task().name"
            />
          } @else {
            <span
              [class.line-through]="task().isDone"
              class="hidden md:block w-full cursor-pointer"
              (click)="toggleExpanded(); $event.stopPropagation()"
              (dblclick)="switchToEditMode()"
            >
              {{ task().name | truncateText:150:isExpanded }}
            </span>
            <span
              [class.line-through]="task().isDone"
              class="md:hidden block w-full cursor-pointer"
              (click)="toggleExpanded(); $event.stopPropagation()"
            >
              {{ task().name | truncateText:150:isExpanded }}
            </span>
          }
        </section>

        @if (task().project) {
          <section class="text-left text-sm mt-2 break-all">
            <span>{{ 'Task.forProject' | translate }}: </span>
            <app-link
              [routerLink]="['/tasks', task().project?.id]"
              class="text-primary-500 hover:underline"
            >
              {{ task().project?.name | truncateText:150:isProjectExpanded }}
            </app-link>
            @if ((task().project?.name ?? '').length > 150) {
              <button
                class="ml-1 text-xs text-text-muted hover:text-text-secondary dark:text-dark-text-muted dark:hover:text-dark-text-secondary"
                (click)="toggleProjectExpanded(); $event.stopPropagation()"
              >
                {{ isProjectExpanded ? '[show less]' : '[...]' }}
              </button>
            }
          </section>
        } @else {
          <section class="text-left text-sm mt-2 break-all">
            <span>{{ 'Task.forProject' | translate }}: </span>
            <span>-</span>
          </section>
        }

        <footer class="pt-2 flex justify-between">
          <button
            class="flex items-center"
            (click)="updateTaskUrgentStatus(); $event.stopPropagation()"
          >
            <ng-icon
              [name]="task().isUrgent ? 'heroBookmarkSolid' : 'heroBookmark'"
              class="text-sm"
            />
          </button>
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
    if (this.task().name.length > 150) {
      this.isExpanded = !this.isExpanded;
    }
  }

  protected toggleProjectExpanded(): void {
    if ((this.task().project?.name ?? '').length > 150) {
      this.isProjectExpanded = !this.isProjectExpanded;
    }
  }

  protected updateTaskUrgentStatus(): void {
    this.update.emit({ isUrgent: !this.task().isUrgent });
  }

  protected updateTaskName(updatedName: string): void {
    const validation = this.taskNameValidator.validateTaskName(updatedName);
    if (!validation.isValid) {
      this.notificationService.showNotification(
        validation.error!,
        NotificationTypeEnum.Error,
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
        this.update.emit({ isDone: !this.task().isDone });
      }
    }, 200);
  }

  protected switchToEditMode(): void {
    this.isSingleClick = false;
    this.editMode = true;
  }

  protected saveTaskName(): void {
    this.autosizeTextarea.submit();
  }
}
