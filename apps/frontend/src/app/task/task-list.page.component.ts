import {
  AfterViewInit,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
  DestroyRef,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroInformationCircle, heroTrash } from '@ng-icons/heroicons/outline';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, EMPTY, map, Observable, switchMap, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProjectCategoryService } from 'src/app/project/data-access/project-category.service';
import { ProjectStatusService } from 'src/app/project/data-access/project-status.service';
import { ProjectUserRoleService } from 'src/app/project/data-access/project-user-role.service';
import { ProjectsService } from 'src/app/project/data-access/project.service';
import { ButtonRoleEnum } from 'src/app/shared/enums/modal.enum';
import { ToastTypeEnum } from 'src/app/shared/enums/toast-type.enum';
import { ModalService } from 'src/app/shared/services/modal.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { TableColumn, TableComponent, TableConfig } from '../shared/components/organisms/table.component';
import { TASKS_LIST_FILTERS, TasksListFiltersConfig } from '../shared/defs/filter.defs';
import { LOADING_STATE_VALUE } from '../shared/defs/list-state.defs';
import { ProjectCategory, ProjectMember, ProjectStatus } from '../project/defs/project.defs';
import { TaskPriorityEnum } from '../shared/enums/task-priority.enum';
import { GetAllTasksSearchParams, TaskListItem, TaskSortFieldEnum } from './defs/task.defs';
import { getContrastColor } from '../shared/utils/color.utils';
import { getAllTasksSearchParams } from './data-access/task-filters.adapter';
import { TasksService } from './data-access/task.service';
import { TasksStateService } from './data-access/task.state.service';
import { PlatformService } from '../shared/services/platform.service';
import { MOBILE_BREAKPOINT } from '../app.contansts';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectRolePermissionEnum } from '../shared/enums/project-role-permission.enum';

@Component({
  selector: 'app-task-list-page',
  imports: [
    TableComponent,
    TranslatePipe,
    ButtonComponent,
    TitleComponent,
    MatTooltipModule,
    ErrorMessageComponent,
    NgIconComponent,
  ],
  viewProviders: [provideIcons({ heroInformationCircle, heroTrash })],
  template: `
    <div class="flex flex-col gap-4">
      <div class="flex flex-row items-center justify-between">
        <div class="flex gap-2 items-center">
          <app-title
            [text]="('Task.project' | translate) + ' : ' + projectName()"
            [limit]="platformService.isMobile() ? 6 : 48"
          />
          @if (projectIsPublic()) {
            <button
              [matTooltip]="publicProjectTooltipText"
              matTooltipPosition="above"
              class="flex items-center justify-center"
            >
              <span class="flex items-center justify-center w-8.75 h-8.75">
                <ng-icon [size]="'30'" name="heroInformationCircle" class="text-blue-500" />
              </span>
            </button>
          }
          @if (selectedTasks().length > 0) {
            <ng-icon (click)="handleBatchDelete()" [size]="'30'" class="cursor-pointer" name="heroTrash" />
            ({{ selectedTasks().length }})
          }
        </div>
        <app-button (click)="navigateToAddTask()">
          {{ 'Task.addTask' | translate }}
        </app-button>
      </div>

      <ng-template #statusTemplate let-task>
        <div class="flex items-center justify-center">
          @if (task.statusName) {
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              [style.background-color]="task.statusColor"
              [style.color]="getContrastColor(task.statusColor)"
            >
              {{ task.statusName }}
            </span>
          } @else {
            <span class="text-sm text-neutral-500 dark:text-neutral-400">-</span>
          }
        </div>
      </ng-template>

      <ng-template #categoriesTemplate let-task>
        <div class="flex items-center justify-center">
          @if (task.categories && task.categories.length > 0) {
            <div class="flex flex-wrap gap-1">
              @for (category of task.categories; track category.id) {
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  [style.background-color]="category.color"
                  [style.color]="getContrastColor(category.color)"
                >
                  {{ getCategoryName(category) }}
                </span>
              }
            </div>
          } @else {
            <span class="text-sm text-neutral-500 dark:text-neutral-400"> - </span>
          }
        </div>
      </ng-template>

      <ng-template #assignedUsersTemplate let-task>
        <div class="flex items-center justify-center">
          @if (task.assignees && task.assignees.length > 0) {
            <div class="flex flex-wrap gap-1">
              @for (user of task.assignees; track user.id) {
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                >
                  {{ user.displayName }}
                </span>
              }
            </div>
          } @else {
            <span class="text-sm text-neutral-500 dark:text-neutral-400"> - </span>
          }
        </div>
      </ng-template>

      @if (tasksStateService.state() === listStateValue.ERROR && tasksStateService.tasks().length === 0) {
        <app-error-message [customMessage]="$safeNavigationMigration(tasksStateService.error()?.message)" />
      } @else {
        <app-table
          [data]="tasksStateService.tasks()"
          [config]="tableConfig()"
          [total]="tasksStateService.pagination().total"
          [loading]="
            (tasksStateService.state() === listStateValue.LOADING && tasksStateService.tasks().length === 0) ||
            isFiltersLoading()
          "
          [customTemplates]="customTemplates()"
          [initialSort]="currentSort()"
          (filterChange)="handleFiltersChange($event)"
          (loadMore)="handleLoadMore()"
          (rowClick)="handleTaskClick($event)"
          (actionClick)="handleActionClick($event)"
          (sortChange)="handleSortChange($event)"
          (selectionChange)="handleSelectionChange($event)"
        />
      }
    </div>
  `,
})
export class TaskListPageComponent implements OnInit, AfterViewInit {
  @ViewChild('statusTemplate', { static: false })
  public readonly statusTemplate!: TemplateRef<any>;
  @ViewChild('categoriesTemplate', { static: false })
  public readonly categoriesTemplate!: TemplateRef<any>;
  @ViewChild('assignedUsersTemplate', { static: false })
  public readonly assignedUsersTemplate!: TemplateRef<any>;

  protected readonly listStateValue = LOADING_STATE_VALUE;

  private readonly destroyRef = inject(DestroyRef);
  private readonly tasksService = inject(TasksService);
  private readonly projectStatusService = inject(ProjectStatusService);
  private readonly projectCategoryService = inject(ProjectCategoryService);
  private readonly projectUserRoleService = inject(ProjectUserRoleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly modalService = inject(ModalService);
  private readonly projectsService = inject(ProjectsService);
  private readonly translateService = inject(TranslateService);

  protected readonly platformService = inject(PlatformService);
  protected readonly tasksStateService = inject(TasksStateService);

  protected isFiltersLoading = signal(true);
  protected projectId = signal<string | null>(null);
  protected taskPermissions = signal<string[]>([]);
  protected projectName = signal<string>('');
  protected projectIsPublic = signal<boolean>(false);
  protected selectedTasks = signal<TaskListItem[]>([]);
  protected customTemplates = signal<{ [key: string]: TemplateRef<any> }>({});

  protected currentSearchParams = signal<GetAllTasksSearchParams>({
    sortBy: TaskSortFieldEnum.CREATED_AT,
    sortDescending: true,
    page: 0,
    size: 10,
  });

  protected currentSort = computed(() => {
    const params = this.currentSearchParams();
    if (params.sortBy === TaskSortFieldEnum.CREATED_AT && params.sortDescending) {
      return null;
    }
    return {
      column: params.sortBy ?? TaskSortFieldEnum.CREATED_AT,
      direction: (params.sortDescending ? 'desc' : 'asc') as 'asc' | 'desc',
    };
  });

  protected readonly tableConfig = computed<TableConfig>(() => ({
    columns: this.getTableColumns(),
    filters: TASKS_LIST_FILTERS,
    filterType: 'tasks',
    collapsibleFilters: true,
    actions: [
      {
        key: 'view',
        label: 'Basic.view',
        icon: 'heroEye',
        color: 'primary',
      },
      {
        key: 'edit',
        label: 'Basic.edit',
        icon: 'heroPencil',
        color: 'secondary',
        visible: () => this.taskPermissions().includes(ProjectRolePermissionEnum.MANAGE_TASKS),
      },
      {
        key: 'delete',
        label: 'Basic.delete',
        icon: 'heroTrash',
        color: 'danger',
        visible: () => this.taskPermissions().includes(ProjectRolePermissionEnum.MANAGE_TASKS),
      },
    ],
    selectable: true,
    sortable: true,
    infiniteScroll: true,
    loadingMore: this.tasksStateService.isLoadingMore(),
    hover: true,
    striped: true,
    responsiveBreakpoint: MOBILE_BREAKPOINT,
    rowClassFunction: (row: TaskListItem) => this.getRowClassByPriority(row),
  }));

  ngOnInit(): void {
    this.initializeTaskList();
    this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const projectId = this.projectId();
      if (projectId) {
        this.loadInitialFilterData(projectId);
        this.getAllTasks(this.currentSearchParams()).subscribe();
      }
    });
  }

  ngAfterViewInit(): void {
    const templates: { [key: string]: TemplateRef<any> } = {};

    if (this.statusTemplate) {
      templates['status'] = this.statusTemplate;
    }

    if (this.categoriesTemplate) {
      templates['categories'] = this.categoriesTemplate;
    }

    if (this.assignedUsersTemplate) {
      templates['assignedUsers'] = this.assignedUsersTemplate;
    }

    this.customTemplates.set(templates);
  }

  protected get publicProjectTooltipText(): string {
    return this.translateService.instant('Project.tasksVisibilityInfo');
  }

  protected handleFiltersChange(filters: TasksListFiltersConfig): void {
    const searchParams = getAllTasksSearchParams({
      ...filters,
    });
    this.currentSearchParams.set(searchParams);
    this.getAllTasks(searchParams).subscribe();
  }

  protected navigateToAddTask(): void {
    const currentProjectId = this.projectId();
    if (currentProjectId) {
      this.router.navigate(['/projects', currentProjectId, 'tasks', 'new']).then();
    } else {
      console.error('No projectId available for adding task');
      this.router.navigate(['/projects']).then();
    }
  }

  protected handleLoadMore(): void {
    if (!this.tasksStateService.hasMore() || this.tasksStateService.isLoadingMore()) {
      return;
    }

    const currentPagination = this.tasksStateService.pagination();
    const nextPage = currentPagination.page + 1;

    const currentParams = this.currentSearchParams();
    const searchParams = {
      ...currentParams,
      page: nextPage,
    };

    const projectId = this.projectId();
    if (projectId) {
      this.tasksService
        .loadMoreByProjectId(projectId, searchParams)
        .pipe(
          catchError(err => {
            this.tasksStateService.setLoadingMore(false);
            if (err.error?.message) {
              this.notificationService.showNotification(err.error.message, ToastTypeEnum.Error);
            } else {
              this.notificationService.showNotification(
                this.translateService.instant('Task.loadMoreError'),
                ToastTypeEnum.Error,
              );
            }
            return EMPTY;
          }),
        )
        .subscribe();
    }
  }

  protected handleTaskClick(task: any): void {
    const projectId = this.projectId();
    if (projectId) {
      this.router.navigate(['/projects', projectId, 'tasks', 'details', task.id]).then();
    }
  }

  protected handleActionClick(event: { action: string; row: any }): void {
    const projectId = this.projectId();
    if (!projectId) return;

    switch (event.action) {
      case 'view':
        this.router.navigate(['/projects', projectId, 'tasks', 'details', event.row.id]).then();
        break;
      case 'edit':
        this.router.navigate(['/projects', projectId, 'tasks', 'edit', event.row.id]).then();
        break;
      case 'delete':
        this.modalService.present({
          title: this.translateService.instant('Task.deleteTitle'),
          message: this.translateService.instant('Task.deleteConfirm'),
          buttons: [
            {
              text: this.translateService.instant('Basic.cancel'),
              role: ButtonRoleEnum.Cancel,
              handler: () => true,
            },
            {
              text: this.translateService.instant('Basic.delete'),
              role: ButtonRoleEnum.Reject,
              handler: () => {
                this.tasksService.delete(String(event.row.id), this.rowVersion(event.row)).subscribe(() => {
                  this.notificationService.showNotification(
                    this.translateService.instant('Task.deleteSuccess'),
                    ToastTypeEnum.Success,
                  );
                });
                return true;
              },
            },
          ],
        });
        break;
    }
  }

  protected handleSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    const sortable: Record<string, TaskSortFieldEnum> = {
      dateCreation: TaskSortFieldEnum.CREATED_AT,
      dateModification: TaskSortFieldEnum.UPDATED_AT,
      description: TaskSortFieldEnum.DESCRIPTION,
      priority: TaskSortFieldEnum.PRIORITY,
    };

    const searchParams: GetAllTasksSearchParams = {
      ...this.currentSearchParams(),
      sortBy: sortable[event.column] ?? TaskSortFieldEnum.CREATED_AT,
      sortDescending: event.direction === 'desc',
      page: 0,
    };

    this.currentSearchParams.set(searchParams);
    this.getAllTasks(searchParams).subscribe();
  }

  protected handleSelectionChange(selectedTasks: TaskListItem[]): void {
    this.selectedTasks.set(selectedTasks);
  }

  protected handleBatchDelete(): void {
    const selected = this.selectedTasks();
    if (selected.length === 0) return;

    this.modalService.present({
      title: this.translateService.instant('Task.deleteSelected'),
      message: this.translateService.instant('Task.batchDeleteConfirm', { count: selected.length }),
      buttons: [
        {
          text: this.translateService.instant('Basic.cancel'),
          role: ButtonRoleEnum.Cancel,
          handler: () => {
            return true;
          },
        },
        {
          text: this.translateService.instant('Basic.delete'),
          role: ButtonRoleEnum.Reject,
          handler: () => {
            this.performBatchDelete(selected);
            return true;
          },
        },
      ],
    });
  }

  protected getContrastColor(backgroundColor: string): string {
    return getContrastColor(backgroundColor);
  }

  protected getCategoryName(category: any): string {
    if (!category) return '';

    if (category.translations && Array.isArray(category.translations)) {
      const currentLang = this.translateService.getCurrentLang() || 'pl';
      const translation = category.translations.find((t: any) => t.lang === currentLang);
      if (translation?.name) {
        return translation.name;
      }
    }

    return category.name || `Category #${category.id}`;
  }

  private getTableColumns(): TableColumn[] {
    return [
      {
        key: 'id',
        label: 'Task.id',
        type: 'text',
        sortable: true,
        width: '6rem',
        priority: 1,
        align: 'center',
        verticalAlign: 'middle',
      },
      {
        key: 'description',
        label: 'Task.description',
        type: 'text',
        align: 'center',
        verticalAlign: 'middle',
        sortable: true,
        truncate: { maxLines: 2, maxChars: 100 },
        priority: 2,
      },
      {
        key: 'status',
        label: 'Task.status',
        type: 'custom',
        customTemplate: 'status',
        sortable: false,
        align: 'center',
        verticalAlign: 'middle',
        width: '8rem',
        priority: 3,
      },
      {
        key: 'assignedUsers',
        label: 'Task.assignedUsers',
        type: 'custom',
        customTemplate: 'assignedUsers',
        sortable: false,
        align: 'center',
        verticalAlign: 'middle',
        width: '12rem',
        priority: 4,
        hideOn: 'mobile',
      },
      {
        key: 'createdAt',
        label: 'Task.dateCreation',
        type: 'date',
        sortable: true,
        hideOn: 'mobile',
        align: 'center',
        verticalAlign: 'middle',
        width: '12rem',
        priority: 5,
      },
      {
        key: 'updatedAt',
        label: 'Task.dateModification',
        type: 'date',
        sortable: true,
        hideOn: 'mobile',
        align: 'center',
        verticalAlign: 'middle',
        width: '12rem',
        priority: 6,
      },
    ];
  }

  private rowVersion(row: { version?: unknown }): number | null {
    return typeof row.version === 'number' ? row.version : null;
  }

  private getRowClassByPriority(task: TaskListItem): string {
    switch (task.priority) {
      case TaskPriorityEnum.HIGH:
        return 'priority-high';
      case TaskPriorityEnum.LOW:
        return 'priority-low';
      default:
        return '';
    }
  }

  private loadTaskPermissions(projectId: string): void {
    this.tasksService
      .getPermissions(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(response => this.taskPermissions.set(response.data ?? []));
  }

  private initializeTaskList(): void {
    this.route.params
      .pipe(
        map(params => params['id']),
        distinctUntilChanged(),
        switchMap(projectId => {
          this.projectId.set(projectId);
          if (projectId) {
            this.loadProjectName(projectId);
            this.loadInitialFilterData(projectId);
            this.loadTaskPermissions(projectId);
          }
          const searchParams = getAllTasksSearchParams({
            sortBy: TaskSortFieldEnum.CREATED_AT,
            sortDescending: true,
            page: 0,
            pageSize: 10,
          });
          this.currentSearchParams.set(searchParams);
          return this.getAllTasks(searchParams);
        }),
      )
      .subscribe();
  }

  private loadProjectName(projectId: string): void {
    this.projectsService.getProjectById(projectId).subscribe(project => {
      this.projectName.set(project.data.name);
      this.projectIsPublic.set(project.data.isPublic);
    });
  }

  private loadInitialFilterData(projectId: string): void {
    this.isFiltersLoading.set(true);

    const statuses$ = this.projectStatusService.getByProjectId(projectId).pipe(
      map(response => response.data ?? []),
      catchError(err => {
        console.error('Error fetching project statuses:', err);
        return of([] as ProjectStatus[]);
      }),
    );

    const categories$ = this.projectCategoryService.getByProjectId(projectId).pipe(
      map(response => response.data ?? []),
      catchError(err => {
        console.error('Error fetching project categories:', err);
        return of([] as ProjectCategory[]);
      }),
    );

    const users$ = this.projectUserRoleService.getUsersInProject(projectId).pipe(
      map(response => response.data ?? []),
      catchError(err => {
        console.error('Error fetching users in project:', err);
        return of([] as ProjectMember[]);
      }),
    );

    forkJoin({ statuses: statuses$, categories: categories$, users: users$ })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ statuses, categories, users }) => {
        this.setFilterOptions(
          'statusId',
          statuses.map(status => ({ value: status.id, label: status.name })),
        );
        this.setFilterOptions(
          'categoryId',
          categories.map(category => ({ value: category.id, label: category.name })),
        );
        this.setFilterOptions(
          'assigneeId',
          users.map(member => ({ value: member.userId, label: member.displayName || member.email })),
        );
        this.isFiltersLoading.set(false);
      });
  }

  private setFilterOptions(formControlName: string, options: Array<{ value: string; label: string }>): void {
    const filter = TASKS_LIST_FILTERS.find(item => item.formControlName === formControlName);
    if (filter) {
      filter.options = options;
    }
  }

  private getAllTasks(searchParams: GetAllTasksSearchParams): Observable<void> {
    const projectId = this.projectId();
    if (!projectId) {
      this.tasksStateService.setTaskList([]);
      return EMPTY;
    }

    this.tasksStateService.resetState();

    return this.tasksService.getAllByProjectId(projectId, searchParams).pipe(
      map(response => {
        const tasks = response.data || {
          items: [],
          pagination: { total: 0, page: 0, pageSize: 10, totalPages: 0, hasMore: false },
        };
        this.tasksStateService.setTaskList(tasks.items);
        this.tasksStateService.setPagination(tasks.pagination);
      }),
      catchError(err => {
        if (err.error?.message) {
          this.notificationService.showNotification(err.error.message, ToastTypeEnum.Error);
        } else {
          this.notificationService.showNotification(
            this.translateService.instant('Task.getAllError'),
            ToastTypeEnum.Error,
          );
        }
        return EMPTY;
      }),
    );
  }

  private performBatchDelete(selectedTasks: TaskListItem[]): void {
    const taskIds = selectedTasks.map(task => task.id);
    this.tasksService.batchDelete(taskIds).subscribe({
      next: () => {
        this.notificationService.showNotification(
          this.translateService.instant('Task.batchDeleteSuccess', { count: selectedTasks.length }),
          ToastTypeEnum.Success,
        );
        this.selectedTasks.set([]);
        const currentParams = this.currentSearchParams();
        this.getAllTasks(currentParams).subscribe();
      },
      error: (err: any) => {
        if (err.error?.message) {
          this.notificationService.showNotification(err.error.message, ToastTypeEnum.Error);
        } else {
          this.notificationService.showNotification(
            this.translateService.instant('Task.batchDeleteError'),
            ToastTypeEnum.Error,
          );
        }
      },
    });
  }
}
