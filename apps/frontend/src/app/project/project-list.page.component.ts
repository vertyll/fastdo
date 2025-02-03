import { Component, OnInit, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { heroCalendar } from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { PaginatorComponent } from '../shared/components/atoms/paginator.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { ButtonRoleEnum, ModalInputTypeEnum } from '../shared/enums/modal.enum';
import { NotificationTypeEnum } from '../shared/enums/notification.enum';
import { ModalService } from '../shared/services/modal.service';
import { NotificationService } from '../shared/services/notification.service';
import { PaginationMeta } from '../shared/types/api-response.type';
import { PaginationParams, ProjectListFiltersConfig } from '../shared/types/filter.type';
import { LOADING_STATE_VALUE } from '../shared/types/list-state.type';
import { GetAllProjectsSearchParams } from '../shared/types/project.type';
import { getAllProjectsSearchParams } from './data-access/project-filters.adapter';
import { ProjectsService } from './data-access/project.service';
import { ProjectsStateService } from './data-access/project.state.service';
import { AddProjectDto } from './dtos/add-project.dto';
import { ProjectCardComponent } from './ui/project-card.component';
import { ProjectsListFiltersComponent } from './ui/project-list-filters.component';
import { ProjectNameValidator } from './validators/project-name.validator';

@Component({
  selector: 'app-project-list-page',
  imports: [
    ProjectsListFiltersComponent,
    TranslateModule,
    ErrorMessageComponent,
    TitleComponent,
    ButtonComponent,
    ProjectCardComponent,
    PaginatorComponent,
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
      @switch (projectsStateService.state()) {
        @case (listStateValue.SUCCESS) {
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (project of projectsStateService.projects(); track project.id) {
                <app-project-card
                  [project]="project"
                  (deleteProject)="deleteProject($event)"
                  (updateProject)="updateProjectName($event.id, $event.name)"
                />
              } @empty {
                <p>{{ 'Project.emptyList' | translate }}</p>
              }
            </div>
            <app-paginator
              [total]="projectsStateService.pagination().total"
              [pageSize]="projectsStateService.pagination().pageSize"
              [currentPage]="projectsStateService.pagination().page"
              (pageChange)="handlePageChange($event)"
            />
          </div>
        }
        @case (listStateValue.ERROR) {
          <app-error-message [customMessage]="projectsStateService.error()?.message"/>
        }
        @case (listStateValue.LOADING) {
          <p class="text-gray-600 dark:text-white">{{ 'Basic.loading' | translate }}</p>
        }
      }
    </div>
  `,
  viewProviders: [
    provideIcons({
      heroCalendar,
    }),
  ],
})
export class ProjectListPageComponent implements OnInit {
  private readonly projectsService = inject(ProjectsService);
  protected readonly projectsStateService = inject(ProjectsStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly projectNameValidator = inject(ProjectNameValidator);
  private readonly modalService = inject(ModalService);
  protected readonly listStateValue = LOADING_STATE_VALUE;

  ngOnInit(): void {
    this.getAllProjects();
  }

  protected openAddProjectModal(): void {
    this.modalService.present({
      title: this.translateService.instant('Project.addProject'),
      inputs: [
        {
          id: 'name',
          type: ModalInputTypeEnum.Textarea,
          required: true,
          label: this.translateService.instant('Project.projectName'),
        },
      ],
      buttons: [
        {
          role: ButtonRoleEnum.Cancel,
          text: this.translateService.instant('Basic.cancel'),
        },
        {
          role: ButtonRoleEnum.Ok,
          text: this.translateService.instant('Basic.save'),
          handler: (data: AddProjectDto) => this.handleAddProject(data),
        },
      ],
    });
  }

  protected handlePageChange(event: PaginationParams): void {
    const { page, pageSize } = event;
    const currentPagination: PaginationMeta = this.projectsStateService.pagination();

    this.projectsStateService.setPagination({
      ...currentPagination,
      page,
    });

    const searchParams: GetAllProjectsSearchParams = getAllProjectsSearchParams({
      page,
      pageSize,
    });

    this.getAllProjects(searchParams);
  }

  private async handleAddProject(data: AddProjectDto): Promise<boolean> {
    const validation = this.projectNameValidator.validateProjectName(data.name);
    if (!validation.isValid) {
      this.modalService.updateConfig({
        error: validation.error,
      });
      return false;
    }

    try {
      await firstValueFrom(this.projectsService.add(data.name));
      this.notificationService.showNotification(
        this.translateService.instant('Project.createSuccess'),
        NotificationTypeEnum.Success,
      );
      return true;
    } catch (err: any) {
      const errorMessage = err.error?.message || this.translateService.instant('Project.createError');

      this.modalService.updateConfig({
        error: errorMessage,
      });
      this.notificationService.showNotification(
        errorMessage,
        NotificationTypeEnum.Error,
      );
      return false;
    }
  }

  protected handleFiltersChange(filters: ProjectListFiltersConfig): void {
    const searchParams = getAllProjectsSearchParams(filters);
    this.getAllProjects(searchParams);
  }

  protected updateProjectName(id: number, newName: string): void {
    if (!this.handleProjectNameValidation(newName)) {
      return;
    }

    this.projectsService.update(id, newName).subscribe({
      error: err => {
        if (err.error && err.error.message) {
          this.notificationService.showNotification(
            err.error.message,
            NotificationTypeEnum.Error,
          );
        } else {
          this.notificationService.showNotification(
            this.translateService.instant('Project.updateError'),
            NotificationTypeEnum.Error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          this.translateService.instant('Project.updateSuccess'),
          NotificationTypeEnum.Success,
        );
      },
    });
  }

  protected deleteProject(id: number): void {
    this.projectsService.delete(id).subscribe({
      error: err => {
        if (err.error && err.error.message) {
          this.notificationService.showNotification(
            err.error.message,
            NotificationTypeEnum.Error,
          );
        } else {
          this.notificationService.showNotification(
            this.translateService.instant('Project.deleteError'),
            NotificationTypeEnum.Error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          this.translateService.instant('Project.deleteSuccess'),
          NotificationTypeEnum.Success,
        );
      },
    });
  }

  private getAllProjects(searchParams?: GetAllProjectsSearchParams): void {
    this.projectsService.getAll(searchParams).subscribe({
      error: err => {
        if (err.error && err.error.message) {
          this.notificationService.showNotification(
            err.error.message,
            NotificationTypeEnum.Error,
          );
        } else {
          this.notificationService.showNotification(
            this.translateService.instant('Project.getAllError'),
            NotificationTypeEnum.Error,
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
        NotificationTypeEnum.Error,
      );
      return false;
    }
    return true;
  }
}
