import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { heroCalendar, heroEye, heroPencil, heroTrash } from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { PaginatorComponent } from '../shared/components/atoms/paginator.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { TableComponent, TableConfig, TableRow } from '../shared/components/organisms/table.component';
import { ButtonRoleEnum } from '../shared/enums/modal.enum';
import { NotificationTypeEnum } from '../shared/enums/notification.enum';
import { ProjectRolePermissionEnum } from '../shared/enums/project-role-permission.enum';
import { ProjectRoleEnum } from '../shared/enums/project-role.enum';
import { ModalService } from '../shared/services/modal.service';
import { NotificationService } from '../shared/services/notification.service';
import { PaginationMeta } from '../shared/types/api-response.type';
import { PaginationParams, ProjectListFiltersConfig } from '../shared/types/filter.type';
import { LOADING_STATE_VALUE } from '../shared/types/list-state.type';
import { GetAllProjectsSearchParams } from '../shared/types/project.type';
import { getAllProjectsSearchParams } from './data-access/project-filters.adapter';
import { ProjectsService } from './data-access/project.service';
import { ProjectsStateService } from './data-access/project.state.service';
import { ProjectsListFiltersComponent } from './ui/project-list-filters.component';

@Component({
  selector: 'app-project-list-page',
  imports: [
    ProjectsListFiltersComponent,
    TranslateModule,
    ErrorMessageComponent,
    TitleComponent,
    ButtonComponent,
    PaginatorComponent,
    TableComponent,
  ],
  template: `
    <div class="flex flex-col mb-6 gap-4">
      <app-title>{{ 'Project.title' | translate }}</app-title>
      <div>
        <app-button (click)="navigateToAddProject()">
          {{ 'Project.addProject' | translate }}
        </app-button>
      </div>
      <app-projects-list-filters
        (filtersChange)="handleFiltersChange($event)"
      />
    </div>
    <div>
      @switch (projectsStateService.state()) {
        @case (listStateValue.SUCCESS) {
          <div class="flex flex-col gap-4">
            <app-table
              [data]="tableRows"
              [config]="tableConfig"
              [customTemplates]="customTemplates"
              [loading]="projectsStateService.state() === listStateValue.LOADING"
              (selectionChange)="onSelectionChange($event)"
              (actionClick)="onActionClick($event)"
              (rowClick)="onRowClick($event)"
              (sortChange)="onSortChange($event)"
            />
            <app-paginator
              [total]="projectsStateService.pagination().total"
              [pageSize]="projectsStateService.pagination().pageSize"
              [currentPage]="projectsStateService.pagination().page"
              (pageChange)="handlePageChange($event)"
            />
          </div>
        }
        @case (listStateValue.ERROR) {
          <app-error-message
            [customMessage]="projectsStateService.error()?.message"
          />
        }
      }
    </div>

    <!-- Custom template for current user role -->
    <ng-template #projectUserRoleTemplate let-row let-column="column">
      <div>
        <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {{ row.projectUserRole }}
        </span>
      </div>
    </ng-template>
  `,
  viewProviders: [
    provideIcons({
      heroCalendar,
      heroEye,
      heroPencil,
      heroTrash,
    }),
  ],
})
export class ProjectListPageComponent implements OnInit, AfterViewInit {
  private readonly projectsService = inject(ProjectsService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly modalService = inject(ModalService);
  protected readonly projectsStateService = inject(ProjectsStateService);

  protected readonly listStateValue = LOADING_STATE_VALUE;
  protected readonly ProjectRoleEnum = ProjectRoleEnum;

  @ViewChild('projectUserRoleTemplate')
  projectUserRoleTemplate!: TemplateRef<any>;

  protected tableRows: TableRow[] = [];
  private rawProjects: any[] = [];

  protected tableConfig: TableConfig = {
    columns: [
      {
        key: 'image',
        label: 'Project.image',
        type: 'image',
        sortable: false,
        width: '5rem',
        align: 'center',
        verticalAlign: 'middle',
        priority: 1,
      },
      {
        key: 'name',
        label: 'Project.name',
        type: 'text',
        sortable: false,
        width: '15rem',
        autoTruncate: true,
        align: 'center',
        verticalAlign: 'middle',
        priority: 2,
      },
      {
        key: 'description',
        label: 'Project.description',
        type: 'text',
        sortable: false,
        width: '18rem',
        autoTruncate: true,
        maxLines: 2,
        align: 'center',
        verticalAlign: 'middle',
        priority: 3,
        hideOn: 'mobile',
      },
      {
        key: 'isPublic',
        label: 'Project.isPublic',
        type: 'boolean',
        sortable: false,
        width: '7rem',
        align: 'center',
        verticalAlign: 'middle',
        priority: 5,
        hideOn: 'tablet',
      },
      {
        key: 'dateCreation',
        label: 'Project.dateCreation',
        type: 'date',
        sortable: false,
        width: '9rem',
        align: 'center',
        verticalAlign: 'middle',
        priority: 6,
        hideOn: 'tablet',
      },
      {
        key: 'type',
        label: 'Project.type',
        type: 'text',
        sortable: false,
        width: '6rem',
        align: 'center',
        verticalAlign: 'middle',
        priority: 4,
        hideOn: 'mobile',
      },
    ],
    actions: [
      {
        key: 'view',
        label: 'Basic.view',
        icon: 'heroEye',
        color: 'primary',
        visible: (row: any) =>
          (row.isPublic === true)
          || (row.permissions && row.permissions.includes(ProjectRolePermissionEnum.SHOW_TASKS)),
        disabled: (row: any) =>
          !((row.isPublic === true)
            || (row.permissions && row.permissions.includes(ProjectRolePermissionEnum.SHOW_TASKS))),
      },
      {
        key: 'edit',
        label: 'Basic.edit',
        icon: 'heroPencil',
        color: 'secondary',
        visible: (row: any) => row.permissions && row.permissions.includes(ProjectRolePermissionEnum.EDIT_PROJECT),
        disabled: (row: any) => !(row.permissions && row.permissions.includes(ProjectRolePermissionEnum.EDIT_PROJECT)),
      },
      {
        key: 'delete',
        label: 'Basic.delete',
        icon: 'heroTrash',
        color: 'danger',
        visible: (row: any) => row.permissions && row.permissions.includes(ProjectRolePermissionEnum.DELETE_PROJECT),
        disabled: (row: any) =>
          !(row.permissions && row.permissions.includes(ProjectRolePermissionEnum.DELETE_PROJECT)),
      },
    ],
    selectable: false,
    sortable: false,
    striped: true,
    hover: true,
    responsiveBreakpoint: 768,
  };

  protected customTemplates: { [key: string]: TemplateRef<any>; } = {};

  ngOnInit(): void {
    this.getAllProjects();
    this.translateService.onLangChange.subscribe(() => {
      if (this.rawProjects.length > 0) {
        this.tableRows = this.mapProjectsToTableRows(this.rawProjects);
      }
    });
  }

  ngAfterViewInit(): void {
    this.customTemplates = {
      projectUserRoleTemplate: this.projectUserRoleTemplate,
    };
  }

  protected async navigateToAddProject(): Promise<void> {
    await this.router.navigate(['/projects/new']);
  }

  protected async navigateToEditProject(projectId: number): Promise<void> {
    await this.router.navigate(['/projects/edit', projectId]);
  }

  protected async navigateToProjectTasks(projectId: number): Promise<void> {
    await this.router.navigate(['/projects', projectId, 'tasks']);
  }

  protected handlePageChange(event: PaginationParams): void {
    const { page, pageSize } = event;
    const currentPagination: PaginationMeta = this.projectsStateService.pagination();

    this.projectsStateService.setPagination({
      ...currentPagination,
      page,
    });

    const searchParams: GetAllProjectsSearchParams = getAllProjectsSearchParams(
      {
        page,
        pageSize,
      },
    );

    this.getAllProjects(searchParams);
  }

  protected handleFiltersChange(filters: ProjectListFiltersConfig): void {
    const searchParams = getAllProjectsSearchParams(filters);
    this.getAllProjects(searchParams);
  }

  protected onSelectionChange(_selected: any[]): void {
    // TODO: Handle selection change logic
  }

  protected onActionClick(event: { action: string; row: any; }): void {
    const { action, row } = event;

    switch (action) {
      case 'view':
        this.navigateToProjectTasks(row.id).then();
        break;
      case 'edit':
        this.navigateToEditProject(row.id).then();
        break;
      case 'delete':
        this.deleteProject(row.id);
        break;
      case 'tasks':
        this.navigateToProjectTasks(row.id).then();
        break;
    }
  }

  protected onRowClick(row: any): void {
    this.navigateToProjectTasks(row.id).then();
  }

  protected onSortChange(_event: { column: string; direction: 'asc' | 'desc'; }): void {
    // TODO: Implement sorting logic
  }

  protected deleteProject(id: number): void {
    this.modalService.present({
      title: this.translateService.instant('Basic.deleteTitle'),
      message: this.translateService.instant('Basic.confirmDelete'),
      buttons: [
        {
          role: ButtonRoleEnum.Cancel,
          text: this.translateService.instant('Basic.cancel'),
          handler: () => {},
        },
        {
          role: ButtonRoleEnum.Ok,
          text: this.translateService.instant('Basic.delete'),
          handler: () => {
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
                this.getAllProjects();
              },
            });
          },
        },
      ],
    });
  }

  private mapProjectsToTableRows(projects: any[]): TableRow[] {
    const lang = this.translateService.currentLang || 'pl';
    return projects.map(project => {
      let typeName = '';
      if (project.type?.translations) {
        const found = project.type.translations.find((t: any) => t.lang === lang);
        typeName = found?.name || project.type.translations[0]?.name || project.type.code || '';
      } else if (project.type?.code) {
        typeName = project.type.code;
      }

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        isPublic: project.isPublic,
        dateCreation: project.dateCreation,
        dateModification: project.dateModification,
        type: typeName,
        image: project.icon?.url || null,
        permissions: project.permissions,
      };
    });
  }

  private getAllProjects(searchParams?: GetAllProjectsSearchParams): void {
    this.projectsService.getAll(searchParams).subscribe({
      next: (response: any) => {
        if (response?.data?.items) {
          this.rawProjects = response.data.items;
          this.tableRows = this.mapProjectsToTableRows(response.data.items);
        }
      },
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
}
