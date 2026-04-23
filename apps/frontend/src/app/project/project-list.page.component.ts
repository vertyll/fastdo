import { AfterViewInit, Component, DestroyRef, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { PaginationMeta } from '../shared/defs/api-response.defs';
import { PaginationParams, ProjectListFiltersConfig } from '../shared/defs/filter.defs';
import { LOADING_STATE_VALUE } from '../shared/defs/list-state.defs';
import { GetAllProjectsSearchParams } from './defs/project.defs';
import { TranslationItem } from '../shared/defs/common.defs';
import { getAllProjectsSearchParams } from './data-access/project-filters.adapter';
import { ProjectsService } from './data-access/project.service';
import { ProjectsStateService } from './data-access/project.state.service';
import { ProjectsListFiltersComponent } from './ui/project-list-filters.component';
import { MOBILE_BREAKPOINT } from '../app.contansts';

interface ProjectTypeData {
  code?: string;
  translations?: TranslationItem[];
}

interface ProjectListItem {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  dateCreation?: number | string;
  dateModification?: number | string;
  icon?: { url?: string | null } | null;
  permissions?: ProjectRolePermissionEnum[];
  type?: ProjectTypeData;
}

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
      <div class="flex flex-row items-center justify-between">
        <app-title [text]="'Project.title' | translate"></app-title>
        <app-button (click)="navigateToAddProject()">
          {{ 'Project.addProject' | translate }}
        </app-button>
      </div>
      <app-projects-list-filters (filtersChange)="handleFiltersChange($event)" />
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
              (actionClick)="onActionClick($event)"
              (rowClick)="onRowClick($event)"
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
          <app-error-message [customMessage]="projectsStateService.error()?.message" />
        }
      }
    </div>

    <!-- Custom template for current user role -->
    <ng-template #projectUserRoleTemplate let-row>
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly projectsService = inject(ProjectsService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly modalService = inject(ModalService);
  protected readonly projectsStateService = inject(ProjectsStateService);

  protected readonly listStateValue = LOADING_STATE_VALUE;
  protected readonly ProjectRoleEnum = ProjectRoleEnum;

  @ViewChild('projectUserRoleTemplate')
  public readonly projectUserRoleTemplate!: TemplateRef<any>;

  protected tableRows: TableRow[] = [];
  private rawProjects: ProjectListItem[] = [];

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
        truncate: { maxLines: 2, maxChars: 100 },
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
        truncate: { maxLines: 2, maxChars: 150 },
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
        visible: (row: any) => row.isPublic === true || row.permissions?.includes(ProjectRolePermissionEnum.SHOW_TASKS),
        disabled: (row: any) =>
          !(row.isPublic === true || row.permissions?.includes(ProjectRolePermissionEnum.SHOW_TASKS)),
      },
      {
        key: 'edit',
        label: 'Basic.edit',
        icon: 'heroPencil',
        color: 'secondary',
        visible: (row: any) => row.permissions?.includes(ProjectRolePermissionEnum.EDIT_PROJECT),
        disabled: (row: any) => !row.permissions?.includes(ProjectRolePermissionEnum.EDIT_PROJECT),
      },
      {
        key: 'delete',
        label: 'Basic.delete',
        icon: 'heroTrash',
        color: 'danger',
        visible: (row: any) => row.permissions?.includes(ProjectRolePermissionEnum.DELETE_PROJECT),
        disabled: (row: any) => !row.permissions?.includes(ProjectRolePermissionEnum.DELETE_PROJECT),
      },
    ],
    selectable: false,
    sortable: false,
    striped: true,
    hover: true,
    responsiveBreakpoint: MOBILE_BREAKPOINT,
  };

  protected customTemplates: { [key: string]: TemplateRef<any> } = {};

  ngOnInit(): void {
    this.getAllProjects();
    this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
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

    const searchParams: GetAllProjectsSearchParams = getAllProjectsSearchParams({
      page,
      pageSize,
    });

    this.getAllProjects(searchParams);
  }

  protected handleFiltersChange(filters: ProjectListFiltersConfig): void {
    const searchParams = getAllProjectsSearchParams(filters);
    this.getAllProjects(searchParams);
  }

  protected onActionClick(event: { action: string; row: TableRow }): void {
    const { action, row } = event;
    const rowId = this.getRowId(row);

    switch (action) {
      case 'view':
        this.navigateToProjectTasks(rowId).then();
        break;
      case 'edit':
        this.navigateToEditProject(rowId).then();
        break;
      case 'delete':
        this.deleteProject(rowId);
        break;
      case 'tasks':
        this.navigateToProjectTasks(rowId).then();
        break;
    }
  }

  protected onRowClick(row: TableRow): void {
    this.navigateToProjectTasks(this.getRowId(row)).then();
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
                this.notifyWithFallback(err, 'Project.deleteError');
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

  private mapProjectsToTableRows(projects: ProjectListItem[]): TableRow[] {
    const lang = this.translateService.getCurrentLang() || 'pl';
    return projects.map(project => {
      const typeName = this.getLocalizedTypeName(project.type, lang);

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

  private getLocalizedTypeName(type: ProjectTypeData | undefined, lang: string): string {
    if (type?.translations) {
      const found = type.translations.find((translation: TranslationItem) => translation.lang === lang);
      return found?.name || type.translations[0]?.name || type.code || '';
    }

    return type?.code || '';
  }

  private notifyWithFallback(error: unknown, fallbackKey: string): void {
    const message = (error as { error?: { message?: string } })?.error?.message;
    this.notificationService.showNotification(
      message || this.translateService.instant(fallbackKey),
      NotificationTypeEnum.Error,
    );
  }

  private getRowId(row: TableRow): number {
    return Number(row['id']);
  }

  private getAllProjects(searchParams?: GetAllProjectsSearchParams): void {
    this.projectsService.getAll(searchParams).subscribe({
      next: response => {
        if (response?.data?.items) {
          const items = response.data.items as ProjectListItem[];
          this.rawProjects = items;
          this.tableRows = this.mapProjectsToTableRows(items);
        }
      },
      error: err => {
        this.notifyWithFallback(err, 'Project.getAllError');
      },
    });
  }
}
