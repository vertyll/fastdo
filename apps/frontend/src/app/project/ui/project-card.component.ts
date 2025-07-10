import { Component, input, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCalendar, heroCheck, heroListBullet, heroPencil } from '@ng-icons/heroicons/outline';
import { TranslateModule } from '@ngx-translate/core';
import { HasProjectRoleDirective } from 'src/app/core/directives/has-project-role.directive';
import { RemoveItemButtonComponent } from 'src/app/shared/components/molecules/remove-item-button.component';
import { ProjectRoleEnum } from 'src/app/shared/enums/project-role.enum';
import { CustomDatePipe } from '../../shared/pipes/custom-date.pipe';
import { TruncateTextPipe } from '../../shared/pipes/truncate-text.pipe';
import { Project } from '../models/Project';

@Component({
  selector: 'app-project-card',
  imports: [
    NgIconComponent,
    RemoveItemButtonComponent,
    TranslateModule,
    TruncateTextPipe,
    CustomDatePipe,
    HasProjectRoleDirective,
  ],
  template: `
    <div
      class="bg-surface-primary rounded-lg border transition-colors duration-200 border-border-primary dark:border-dark-border-primary shadow-sm p-4 hover:shadow-md dark:bg-dark-surface-primary dark:text-dark-text-primary flex flex-col h-full"
    >
      <header class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-2">
          @if (project().type) {
            <span
              class="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full text-xs font-medium"
            >
              {{ project().type!.name }}
            </span>
          }
          @if (project().isPublic) {
            <span
              class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full text-xs font-medium"
            >
              {{ 'Project.public' | translate }}
            </span>
          }
        </div>
        <div class="flex gap-1">
          <button
            class="flex items-center justify-center p-1.5 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-green-600 dark:text-green-400"
            (click)="viewTasks.emit(project().id)"
            title="{{ 'Project.viewTasks' | translate }}"
          >
            <ng-icon name="heroListBullet" size="16" />
          </button>
          <button
            [appHasProjectRole]="ProjectRoleEnum.MANAGER"
            [currentUserRole]="project().currentUserRole"
            class="flex items-center justify-center p-1.5 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
            (click)="editProject.emit(project().id)"
            title="{{ 'Basic.edit' | translate }}"
          >
            <ng-icon name="heroPencil" size="16" />
          </button>
          <app-remove-item-button
            [appHasProjectRole]="ProjectRoleEnum.MANAGER"
            [currentUserRole]="project().currentUserRole"
            (confirm)="deleteProject.emit(project().id)"
          />
        </div>
      </header>

      <section class="text-left flex-grow">
        <div>
          <h3
            class="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-1"
          >
            {{ project().name }}
          </h3>
          <p
            class="text-sm text-text-secondary dark:text-dark-text-primary line-clamp-2 break-all"
          >
            {{ project().description | truncateText: 50 }}
          </p>
        </div>
      </section>

      @if ((project().categories || []).length > 0) {
        <div class="mb-3">
          <div class="flex flex-wrap gap-1">
            @for (
              category of (project().categories || []).slice(0, 3);
              track category.id
            ) {
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                [style.background-color]="category.color + '20'"
                [style.color]="category.color"
              >
                {{ category.name }}
              </span>
            }
            @if ((project().categories || []).length > 3) {
              <span
                class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs"
              >
                +{{ (project().categories || []).length - 3 }}
              </span>
            }
          </div>
        </div>
      }

      <div
        class="flex flex-col text-text-secondary dark:text-dark-text-primary text-sm mt-2 transition-colors duration-200 space-y-1"
      >
        <div class="flex items-center">
          <ng-icon name="heroCalendar" class="mr-2" size="14"></ng-icon>
          <span
            >{{ 'Project.created' | translate }}:
            {{ project().dateCreation | customDate }}</span
          >
        </div>
        @if (project().dateModification) {
          <div class="flex items-center">
            <ng-icon name="heroCalendar" class="mr-2" size="14"></ng-icon>
            <span
              >{{ 'Project.modified' | translate }}:
              {{ project().dateModification | customDate }}</span
            >
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .break-all {
        word-break: break-all;
      }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
  viewProviders: [
    provideIcons({
      heroCalendar,
      heroPencil,
      heroCheck,
      heroListBullet,
    }),
  ],
})
export class ProjectCardComponent {
  readonly project = input.required<Project>();
  readonly deleteProject = output<number>();
  readonly editProject = output<number>();
  readonly updateProject = output<{ id: number; name: string; }>();
  readonly viewTasks = output<number>();

  protected readonly ProjectRoleEnum = ProjectRoleEnum;
}
