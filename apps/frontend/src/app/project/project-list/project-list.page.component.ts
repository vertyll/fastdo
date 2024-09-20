import { Component, inject } from '@angular/core';
import { Project } from '../model/Project';
import { ListState, LIST_STATE_VALUE } from '../../utils/list-state.type';
import { SubmitTextComponent } from '@ui/submit-text.component';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherCalendar, featherEdit } from '@ng-icons/feather-icons';
import { CustomDatePipe } from '../../utils/pipes/custom-date.pipe';
import {
  ProjectsListFiltersComponent,
  ProjectsListFiltersFormValue,
} from '../ui/project-list-filters.component';
import { RemoveItemButtonComponent } from '@ui/remove-item-button.component';
import { AutosizeTextareaComponent } from '@ui/autosize-textarea.component';
import { getAllProjectsSearchParams } from '../data-access/project-filters.adapter';
import { ProjectsStateService } from '../data-access/project.state.service';
import { ProjectsService } from '../data-access/project.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NotificationType } from 'src/app/shared/enums/notification.enum';
import { Role } from 'src/app/shared/enums/role.enum';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { HasRoleDirective } from 'src/app/core/directives/has-role.directive';

interface GetAllProjectsSearchParams {
  q: string;
  sortBy: 'name' | 'dateCreation';
  orderBy: 'asc' | 'desc';
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
}

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
  ],
  template: `
    <div class="flex flex-col items-center mb-6">
      <h2 class="text-2xl font-bold mb-4">Projects</h2>
      <app-submit-text
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
                      class="text-xl font-semibold mb-2 text-blue-600 hover:text-blue-800"
                    >
                      {{ project.name }}
                    </h3>
                  }
                </section>
                <div class="flex flex-col text-gray-600 text-sm mt-2">
                  <div class="flex items-center">
                    <ng-icon name="featherCalendar" class="mr-1"></ng-icon>
                    <span
                      >Created: {{ project.dateCreation | customDate }}</span
                    >
                  </div>
                  @if (project.dateModification) {
                    <div class="flex items-center mt-1">
                      <ng-icon name="featherCalendar" class="mr-1"></ng-icon>
                      <span
                        >Updated:
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
                    <ng-icon name="featherEdit" class="text-sm" />
                  </button>
                  <a
                    [routerLink]="['/tasks', project.id]"
                    class="text-blue-500 hover:underline"
                  >
                    View task
                  </a>
                </footer>
              </div>
            }
          </div>
        }
        @case (listStateValue.ERROR) {
          <p class="text-red-500">
            {{ listState.error.message }}
          </p>
        }
        @case (listStateValue.LOADING) {
          <p class="text-gray-600">Loading...</p>
        }
      }
    </div>
  `,
  viewProviders: [provideIcons({ featherCalendar, featherEdit })],
})
export class ProjectListPageComponent {
  private readonly projectsService = inject(ProjectsService);
  private readonly projectsStateService = inject(ProjectsStateService);
  private readonly notificationService = inject(NotificationService);
  protected readonly role = Role;

  listState: ListState<Project> = { state: LIST_STATE_VALUE.IDLE };
  listStateValue = LIST_STATE_VALUE;

  ngOnInit(): void {
    this.getAllProjects();
  }

  getAllProjects(searchParams?: GetAllProjectsSearchParams): void {
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
            'An error occurred fetching the projects.',
            NotificationType.error,
          );
        }
      },
    });
  }

  addProject(name: string, projects: Project[]): void {
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
            'An error occurred creating the project.',
            NotificationType.error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          'Project created successfully.',
          NotificationType.success,
        );
      },
    });
  }

  handleFiltersChange(filters: ProjectsListFiltersFormValue): void {
    const searchParams = getAllProjectsSearchParams(filters);
    this.getAllProjects(searchParams);
  }

  toggleEditMode(project: Project): void {
    project.editMode = !project.editMode;
  }

  updateProjectName(id: number, newName: string): void {
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
            'An error occurred updating the project.',
            NotificationType.error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          'Project updated successfully.',
          NotificationType.success,
        );
      },
    });
  }

  deleteProject(id: number): void {
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
            'An error occurred deleting the project.',
            NotificationType.error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          'Project deleted successfully.',
          NotificationType.success,
        );
      },
    });
  }
}
