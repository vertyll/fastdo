import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCalendar, heroCheck, heroPencil, heroPencilSquare } from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AutosizeTextareaComponent } from 'src/app/shared/components/atoms/autosize-textarea.component';
import { RemoveItemButtonComponent } from 'src/app/shared/components/molecules/remove-item-button.component';
import { NotificationType } from 'src/app/shared/enums/notification.enum';
import { Role } from 'src/app/shared/enums/role.enum';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { HasRoleDirective } from '../core/directives/has-role.directive';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { LinkComponent } from '../shared/components/atoms/link.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { CustomDatePipe } from '../shared/pipes/custom-date.pipe';
import { TruncateTextPipe } from '../shared/pipes/truncate-text.pipe';
import { ProjectListFiltersConfig } from '../shared/types/filter.type';
import { LIST_STATE_VALUE, ListState } from '../shared/types/list-state.type';
import { getAllProjectsSearchParams } from './data-access/project-filters.adapter';
import { GetAllProjectsSearchParams } from './data-access/project.api.service';
import { ProjectsService } from './data-access/project.service';
import { ProjectsStateService } from './data-access/project.state.service';
import { Project } from './models/Project';
import { ProjectsListFiltersComponent } from './ui/project-list-filters.component';
import { ProjectNameValidator } from './validators/project-name.validator';
import {ModalService} from "../shared/services/modal.service";
import {firstValueFrom} from "rxjs";
import {ButtonRole, ModalInputType} from "../shared/enums/modal.enum";
import {ButtonComponent} from "../shared/components/atoms/button.component";

@Component({
  selector: 'app-project-list-page',
  imports: [
    RouterLink,
    NgIconComponent,
    CustomDatePipe,
    ProjectsListFiltersComponent,
    RemoveItemButtonComponent,
    AutosizeTextareaComponent,
    TranslateModule,
    ErrorMessageComponent,
    TitleComponent,
    LinkComponent,
    HasRoleDirective,
    TruncateTextPipe,
    ButtonComponent,
  ],
  template: `
    <div class="flex flex-col mb-6 gap-4">
      <app-title>{{ 'Project.title' | translate }}</app-title>
      <app-button (click)="openAddProjectModal()">
        {{ 'Project.addProject' | translate }}
      </app-button>
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
                class="bg-white rounded-lg border transition-colors duration-200 border-gray-300 shadow-sm p-4 hover:shadow-md dark:bg-gray-600 dark:text-white flex flex-col h-full"
              >
                <header class="flex justify-end">
                  <ng-template [appHasRole]="[role.Admin]">
                    <app-remove-item-button
                      (confirm)="deleteProject(project.id)"
                    />
                    @if (!project.editMode) {
                      <button
                        class="flex items-center justify-center p-2 rounded-md transition-all duration-200 hover:scale-125 text-black dark:text-white"
                        (click)="toggleEditMode(project)"
                      >
                        <ng-icon name="heroPencil" size="18"/>
                      </button>
                    } @else {
                      <button
                        class="flex items-center justify-center p-2 rounded-md transition-all duration-200 hover:scale-125 text-black dark:text-white"
                        (click)="updateProjectName(project.id, project.name)"
                      >
                        <ng-icon name="heroCheck" size="18"/>
                      </button>
                    }
                  </ng-template>
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
                      class="text-xl font-semibold mb-2 break-all cursor-pointer"
                      (click)="toggleExpanded(project)"
                    >
                      {{ project.name | truncateText:150:(project.isExpanded || false) }}
                    </h3>
                  }
                </section>
                <div class="flex flex-col text-gray-600 dark:text-white text-sm mt-2 transition-colors duration-200">
                  <div class="flex items-center">
                    <ng-icon name="heroCalendar" class="mr-1"></ng-icon>
                    <span>{{ 'Project.created' | translate }}: {{ project.dateCreation | customDate }}</span>
                  </div>
                  <div class="flex items-center mt-1">
                    <ng-icon name="heroCalendar" class="mr-1"></ng-icon>
                    <span>{{ 'Project.modified' | translate }}: {{ (project.dateModification | customDate) || '-' }}</span>
                  </div>
                </div>

                <footer class="pt-2 flex justify-between items-center mt-auto">
                  <app-link [routerLink]="['/tasks', project.id]">
                    {{ 'Project.viewTasks' | translate }}
                  </app-link>
                </footer>
              </div>
            } @empty {
              <p>{{ 'Project.emptyList' | translate }}</p>
            }
          </div>
        }
        @case (listStateValue.ERROR) {
          <app-error-message [customMessage]="listState.error.message"/>
        }
        @case (listStateValue.LOADING) {
          <p class="text-gray-600">{{ 'Basic.loading' | translate }}</p>
        }
      }
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
      heroPencilSquare,
      heroPencil,
      heroCheck,
    }),
  ],
})
export class ProjectListPageComponent implements OnInit {
  private readonly projectsService = inject(ProjectsService);
  private readonly projectsStateService = inject(ProjectsStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly projectNameValidator = inject(ProjectNameValidator);
  private  readonly modalService = inject(ModalService);
  protected readonly role = Role;
  protected readonly listStateValue = LIST_STATE_VALUE;
  protected listState: ListState<Project> = { state: LIST_STATE_VALUE.IDLE };

  ngOnInit(): void {
    this.getAllProjects();
  }

  protected toggleExpanded(project: Project): void {
    project.isExpanded = !project.isExpanded;
  }

  protected openAddProjectModal(): void {
    this.modalService.present({
      title: this.translateService.instant('Project.addProject'),
      inputs: [
        {
          id: 'name',
          type: ModalInputType.Textarea,
          required: true,
          label: this.translateService.instant('Project.projectName'),
        }
      ],
      buttons: [
        {
          role: ButtonRole.Cancel,
          text: this.translateService.instant('Basic.cancel'),
        },
        {
          role: ButtonRole.Ok,
          text: this.translateService.instant('Basic.save'),
          handler: (data: { name: string }) => this.handleAddProject(data.name),
        },
      ],
    });
  }

  private async handleAddProject(name: string): Promise<boolean> {
    const validation = this.projectNameValidator.validateProjectName(name);
    if (!validation.isValid) {
      this.modalService.updateConfig({
        error: validation.error,
      });
      return false;
    }

    try {
      const project = await firstValueFrom(this.projectsService.add(name));
      if (this.listState.state === LIST_STATE_VALUE.SUCCESS) {
        this.listState = {
          ...this.listState,
          results: [...this.listState.results, project],
        };
      }
      this.notificationService.showNotification(
        this.translateService.instant('Project.createSuccess'),
        NotificationType.success,
      );
      return true;
    } catch (err: any) {
      const errorMessage = err.error?.message || this.translateService.instant('Project.createError');

      this.modalService.updateConfig({
        error: errorMessage,
      });
      this.notificationService.showNotification(
        errorMessage,
        NotificationType.error,
      );
      return false;
    }
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
      next: updatedProject => {
        if (this.listState.state === LIST_STATE_VALUE.SUCCESS) {
          this.listState = {
            ...this.listState,
            results: this.listState.results.map(project =>
              project.id === id
                ? { ...updatedProject, editMode: false }
                : project
            ),
          };
        }
      },
      error: err => {
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
              project => project.id !== id,
            ),
          };
          this.projectsStateService.removeProject(id);
        }
      },
      error: err => {
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
      next: response => {
        const projects = response.body || [];
        this.listState = {
          state: LIST_STATE_VALUE.SUCCESS,
          results: projects,
        };
        this.projectsStateService.setProjectList(projects);
      },
      error: err => {
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
