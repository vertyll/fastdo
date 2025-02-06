import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCalendar, heroCheck, heroPencil } from '@ng-icons/heroicons/outline';
import { TranslateModule } from '@ngx-translate/core';
import { AutosizeTextareaComponent } from 'src/app/shared/components/atoms/autosize-textarea.component';
import { RemoveItemButtonComponent } from 'src/app/shared/components/molecules/remove-item-button.component';
import { LinkComponent } from '../../shared/components/atoms/link.component';
import { CustomDatePipe } from '../../shared/pipes/custom-date.pipe';
import { TruncateTextPipe } from '../../shared/pipes/truncate-text.pipe';
import { Project } from '../models/Project';

@Component({
  selector: 'app-project-card',
  imports: [
    RouterLink,
    NgIconComponent,
    RemoveItemButtonComponent,
    AutosizeTextareaComponent,
    TranslateModule,
    LinkComponent,
    TruncateTextPipe,
    CustomDatePipe,
  ],
  template: `
    <div class="bg-white rounded-lg border transition-colors duration-200 border-gray-300 shadow-sm p-4 hover:shadow-md dark:bg-gray-600 dark:text-white flex flex-col h-full">
      <header class="flex justify-end">
          <app-remove-item-button
            (confirm)="deleteProject.emit(project().id)"
          />
          @if (!isEditMode()) {
            <button
              class="flex items-center justify-center p-2 rounded-md transition-all duration-200 hover:scale-125 text-black dark:text-white"
              (click)="toggleEditMode()"
            >
              <ng-icon name="heroPencil" size="18"/>
            </button>
          } @else {
            <button
              class="flex items-center justify-center p-2 rounded-md transition-all duration-200 hover:scale-125 text-black dark:text-white"
              (click)="onUpdateProject(project().id, project().name)"
            >
              <ng-icon name="heroCheck" size="18"/>
            </button>
          }
      </header>
      <section class="text-left flex-grow">
        @if (isEditMode()) {
          <app-autosize-textarea
            (keyup.escape)="setEditMode(false)"
            (submitText)="onUpdateProject(project().id, $event)"
            [value]="project().name"
          />
        } @else {
          <h3
            class="text-xl font-semibold mb-2 break-all cursor-pointer"
            (click)="toggleExpanded()"
          >
            {{ project().name | truncateText:150:isExpanded() }}
          </h3>
        }
      </section>
      <div class="flex flex-col text-gray-600 dark:text-white text-sm mt-2 transition-colors duration-200">
        <div class="flex items-center">
          <ng-icon name="heroCalendar" class="mr-1"></ng-icon>
          <span>{{ 'Project.created' | translate }}: {{ project().dateCreation | customDate }}</span>
        </div>
        <div class="flex items-center mt-1">
          <ng-icon name="heroCalendar" class="mr-1"></ng-icon>
          <span>{{ 'Project.modified' | translate }}: {{ (project().dateModification | customDate) || '-' }}</span>
        </div>
      </div>

      <footer class="pt-2 flex justify-between items-center mt-auto">
        <app-link [routerLink]="['/tasks', project().id]">
          {{ 'Project.viewTasks' | translate }}
        </app-link>
      </footer>
    </div>
  `,
  styles: [`
    .break-all {
      word-break: break-all;
    }
  `],
  viewProviders: [
    provideIcons({
      heroCalendar,
      heroPencil,
      heroCheck,
    }),
  ],
})
export class ProjectCardComponent {
  readonly project = input.required<Project>();
  readonly deleteProject = output<number>();
  readonly updateProject = output<{ id: number; name: string; }>();

  private readonly editModeSignal = signal(false);
  private readonly expandedSignal = signal(false);

  protected readonly isEditMode = computed(() => this.editModeSignal());
  protected readonly isExpanded = computed(() => this.expandedSignal());

  protected toggleExpanded(): void {
    this.expandedSignal.update(value => !value);
  }

  protected toggleEditMode(): void {
    this.editModeSignal.update(value => !value);
  }

  protected setEditMode(value: boolean): void {
    this.editModeSignal.set(value);
  }

  protected onUpdateProject(id: number, name: string): void {
    this.updateProject.emit({ id, name });
    this.setEditMode(false);
  }
}
