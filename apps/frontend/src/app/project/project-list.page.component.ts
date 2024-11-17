import { Component, inject } from '@angular/core';
import { Project } from './models/Project';
import { ListState, LIST_STATE_VALUE } from '../shared/types/list-state.type';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCalendar, heroPencilSquare } from '@ng-icons/heroicons/outline';
import { CustomDatePipe } from '../shared/pipes/custom-date.pipe';
import { RemoveItemButtonComponent } from 'src/app/shared/components/molecules/remove-item-button.component';
import { getAllProjectsSearchParams } from './data-access/project-filters.adapter';
import { ProjectsStateService } from './data-access/project.state.service';
import { ProjectsService } from './data-access/project.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NotificationType } from 'src/app/shared/enums/notification.enum';
import { Role } from 'src/app/shared/enums/role.enum';
import { HasRoleDirective } from 'src/app/core/directives/has-role.directive';
import { AutosizeTextareaComponent } from 'src/app/shared/components/atoms/autosize-textarea.component';
import { SubmitTextComponent } from 'src/app/shared/components/molecules/submit-text.component';
import { GetAllProjectsSearchParams } from './data-access/project.api.service';
import { ProjectsListFiltersComponent } from './ui/project-list-filters.component';
import { ProjectListFiltersConfig } from '../shared/types/filter.type';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProjectNameValidator } from './validators/project-name.validator';

@Component({
  selector: 'app-project-list-page',
  standalone: true,
  imports: [
    SubmitTextComponent,
    RouterLink,
    NgIconComponent,
    CustomDatePipe,
    ProjectsListFiltersComponent,
    RemoveItemButtonComponent,
    AutosizeTextareaComponent,
    HasRoleDirective,
    TranslateModule,
  ],
  template: `
    <div class="flex flex-col mb-6 gap-4">
      <h2 class="text-2xl font-bold mb-4">{{ 'Project.title' | translate }}</h2>
      <app-submit-text
        placeholder="{{ 'Project.addPlaceholder' | translate }}"
        [type]="'text'"
        (submitText)="
          listState.state === listStateValue.SUCCESS &&
            addProject($event, listState.results)
        "
      />
      <app-projects-list-filters
        (filtersChange)="handleFiltersChange($event)"
      />
    </div>
    <div>
      @switch (listState.state) {
        @case (listStateValue.SUCCESS) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (project of listState.results; track project.id) {
              <div
                class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
              >
                <header class="flex justify-end">
                  <app-remove-item-button
                    *appHasRole="[role.Admin]"
                    (confirm)="deleteProject(project.id)"
                  />
                </header>
                <section class="text-left flex-grow">
                  @if (project.editMode) {
                    <app-autosize-textarea
                      (keyup.escape)="project.editMode = false"
                      (submitText)="updateProjectName(project.id, $event)"
                      [value]="project.name"
                    />
                  } @else {
                    <h3
                      class="text-xl font-semibold mb-2 text-orange-600 hover:text-orange-800 break-all"
                    >
                      {{ project.name }}
                    </h3>
                  }
                </section>
                <div class="flex flex-col text-gray-600 text-sm mt-2">
                  <div class="flex items-center">
                    <ng-icon name="heroCalendar" class="mr-1"></ng-icon>
                    <span
                      >{{ 'Project.created' | translate }}:
                      {{ project.dateCreation | customDate }}</span
                    >
                  </div>
                  @if (project.dateModification) {
                    <div class="flex items-center mt-1">
                      <ng-icon name="heroCalendar" class="mr-1"></ng-icon>
                      <span
                        >{{ 'Project.modified' | translate }}:
                        {{ project.dateModification | customDate }}</span
                      >
                    </div>
                  }
                </div>
                <footer class="pt-2 flex justify-between items-center mt-auto">
                  <button
                    *appHasRole="[role.Admin]"
                    class="flex items-center"
                    (click)="toggleEditMode(project)"
                  >
                    <ng-icon name="heroPencilSquare" class="text-sm" />
                  </button>
                  <a
                    [routerLink]="['/tasks', project.id]"
                    class="text-orange-500 hover:underline"
                  >
                    {{ 'Project.viewTasks' | translate }}
                  </a>
                </footer>
              </div>
            } @empty {
              <p>
                {{ 'Project.emptyList' | translate }}
              </p>
            }
          </div>
        }
        @case (listStateValue.ERROR) {
          <p class="text-red-500">
            {{ listState.error.message }}
          </p>
        }
        @case (listStateValue.LOADING) {
          <p class="text-gray-600">{{ 'Basic.loading' | translate }}</p>
        }
      }
    </div>
  `,
  styles: [
    `
      .break-all {
        word-break: break-all;
      }
    `,
  ],
  viewProviders: [provideIcons({ heroCalendar, heroPencilSquare })],
})
export class ProjectListPageComponent {
  private readonly projectsService = inject(ProjectsService);
  private readonly projectsStateService = inject(ProjectsStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly projectNameValidator = inject(ProjectNameValidator);
  protected readonly role = Role;
  protected readonly listStateValue = LIST_STATE_VALUE;
  protected listState: ListState<Project> = { state: LIST_STATE_VALUE.IDLE };

  ngOnInit(): void {
    this.getAllProjects();
  }

  protected addProject(name: string, projects: Project[]): void {
    if (!this.handleProjectNameValidation(name)) {
      return;
    }

    this.projectsService.add(name).subscribe({
      next: (project) => {
        this.listState = {
          state: LIST_STATE_VALUE.SUCCESS,
          results: [...projects, project],
        };
      },
      error: (err) => {
        this.listState = {
          state: LIST_STATE_VALUE.ERROR,
          error: err,
        };

        if (err.error && err.error.message) {
          this.notificationService.showNotification(
            err.error.message,
            NotificationType.error,
          );
        } else {
          this.notificationService.showNotification(
            this.translateService.instant('Project.createError'),
            NotificationType.error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          this.translateService.instant('Project.createSuccess'),
          NotificationType.success,
        );
      },
    });
  }

  protected handleFiltersChange(filters: ProjectListFiltersConfig): void {
    const searchParams = getAllProjectsSearchParams(filters);
    this.getAllProjects(searchParams);
  }

  protected toggleEditMode(project: Project): void {
    project.editMode = !project.editMode;
  }

  protected updateProjectName(id: number, newName: string): void {
    if (!this.handleProjectNameValidation(newName)) {
      return;
    }

    this.projectsService.update(id, newName).subscribe({
      next: (updatedProject) => {
        if (this.listState.state === LIST_STATE_VALUE.SUCCESS) {
          this.listState = {
            ...this.listState,
            results: this.listState.results.map((project) =>
              project.id === id
                ? { ...updatedProject, editMode: false }
                : project,
            ),
          };
        }
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.notificationService.showNotification(
            err.error.message,
            NotificationType.error,
          );
        } else {
          this.notificationService.showNotification(
            this.translateService.instant('Project.updateError'),
            NotificationType.error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          this.translateService.instant('Project.updateSuccess'),
          NotificationType.success,
        );
      },
    });
  }

  protected deleteProject(id: number): void {
    this.projectsService.delete(id).subscribe({
      next: () => {
        if (this.listState.state === LIST_STATE_VALUE.SUCCESS) {
          this.listState = {
            ...this.listState,
            results: this.listState.results.filter(
              (project) => project.id !== id,
            ),
          };
          this.projectsStateService.removeProject(id);
        }
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.notificationService.showNotification(
            err.error.message,
            NotificationType.error,
          );
        } else {
          this.notificationService.showNotification(
            this.translateService.instant('Project.deleteError'),
            NotificationType.error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          this.translateService.instant('Project.deleteSuccess'),
          NotificationType.success,
        );
      },
    });
  }

  private getAllProjects(searchParams?: GetAllProjectsSearchParams): void {
    this.listState = { state: LIST_STATE_VALUE.LOADING };

    this.projectsService.getAll(searchParams).subscribe({
      next: (response) => {
        const projects = response.body || [];
        this.listState = {
          state: LIST_STATE_VALUE.SUCCESS,
          results: projects,
        };
        this.projectsStateService.setProjectList(projects);
      },
      error: (err) => {
        this.listState = {
          state: LIST_STATE_VALUE.ERROR,
          error: err,
        };

        if (err.error && err.error.message) {
          this.notificationService.showNotification(
            err.error.message,
            NotificationType.error,
          );
        } else {
          this.notificationService.showNotification(
            this.translateService.instant('Project.getAllError'),
            NotificationType.error,
          );
        }
      },
    });
  }

  private handleProjectNameValidation(name: string): boolean {
    const validation = this.projectNameValidator.validateProjectName(name);
    if (!validation.isValid) {
      this.notificationService.showNotification(
        validation.error!,
        NotificationType.error,
      );
      return false;
    }
    return true;
  }
}
