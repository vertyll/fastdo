import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../models/Task';
import { RemoveItemButtonComponent } from 'src/app/shared/components/remove-item-button.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { CustomDatePipe } from 'src/app/shared/pipes/custom-date.pipe';
import { heroBookmark } from '@ng-icons/heroicons/outline';
import { heroBookmarkSolid } from '@ng-icons/heroicons/solid';
import { TaskUpdatePayload } from '../data-access/task.api.service';
import { RouterLink } from '@angular/router';
import { AutosizeTextareaComponent } from 'src/app/shared/components/autosize-textarea.component';

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
      class="rounded-md shadow-md p-4 block"
      [class.bg-green-300]="task.isDone"
    >
      <button
        class="w-full"
        (click)="!editMode && handleSingleClick()"
        (dblclick)="switchToEditMode()"
      >
        <header class="flex justify-end">
          <app-remove-item-button (confirm)="delete.emit()" />
        </header>
        <section class="text-left">
          @if (editMode) {
            <app-autosize-textarea
              (keyup.escape)="editMode = false"
              (submitText)="updateTaskName($event)"
              [value]="task.name"
            />
          } @else {
            <span [class.line-through]="task.isDone">
              {{ task.name }}
            </span>
          }
        </section>
        @if (task.project) {
          <section class="text-left text-sm mt-2">
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
              <ng-icon name="featherCalendar" class="text-sm" />
            </div>
            @if (task.dateModification) {
              <div class="flex items-center">
                <span class="pr-1"
                  >Updated: {{ task.dateModification | customDate }}</span
                >
                <ng-icon name="featherCalendar" class="text-sm" />
              </div>
            }
          </div>
        </footer>
      </button>
    </div>
  `,
  styles: [],
  viewProviders: [provideIcons({ heroBookmark, heroBookmarkSolid })],
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() update = new EventEmitter<TaskUpdatePayload>();
  @Output() delete = new EventEmitter<void>();

  protected editMode: boolean = false;
  private isSingleClick: boolean = true;

  protected updateTaskUrgentStatus(): void {
    this.update.emit({ isUrgent: !this.task.isUrgent });
  }

  protected updateTaskName(updatedName: string): void {
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
