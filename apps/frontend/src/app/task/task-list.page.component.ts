import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroInformationCircle } from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EMPTY, Observable, distinctUntilChanged, map, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProjectsService } from 'src/app/project/data-access/project.service';
import { ButtonRoleEnum } from 'src/app/shared/enums/modal.enum';
import { NotificationTypeEnum } from 'src/app/shared/enums/notification.enum';
import { ModalService } from 'src/app/shared/services/modal.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { TableColumn, TableComponent, TableConfig } from '../shared/components/organisms/table.component';
import { TasksListFiltersConfig } from '../shared/types/filter.type';
import { LOADING_STATE_VALUE } from '../shared/types/list-state.type';
import { GetAllTasksSearchParams } from '../shared/types/task.type';
import { getContrastColor } from '../shared/utils/color.utils';
import { getAllTasksSearchParams } from './data-access/task-filters.adapter';
import { TasksService } from './data-access/task.service';
import { TasksStateService } from './data-access/task.state.service';
import { Task } from './models/Task';
import { TasksListFiltersComponent } from './ui/task-list-filters.component';

@Component({
  selector: 'app-task-list-page',
  imports: [
    TasksListFiltersComponent,
    TableComponent,
    TranslateModule,
    ButtonComponent,
    TitleComponent,
    MatTooltipModule,
    ErrorMessageComponent,
    NgIconComponent,
  ],
  viewProviders: [provideIcons({ heroInformationCircle })],
  template: `
    <div class="flex flex-col gap-4">
      <app-title>
        {{ 'Task.taskForProject' | translate }}
        : {{ projectName() }}
      </app-title>
      <div class="flex gap-2 items-center">
        <app-button (click)="navigateToAddTask()">
          {{ 'Task.addTask' | translate }}
        </app-button>
        @if (projectIsPublic()) {
          <button
            mat-icon-button
            [matTooltip]="publicProjectTooltipText"
            matTooltipPosition="above"
            class="flex items-center justify-center"
          >
            <span class="flex items-center justify-center w-[35px] h-[35px]">
              <ng-icon [size]="'30'" name="heroInformationCircle" class="text-blue-500" />
            </span>
          </button>
        }
        @if (selectedTasks().length > 0) {
          <app-button
            (click)="handleBatchDelete()"
            [disabled]="selectedTasks().length === 0"
            cssClass="bg-danger-500 dark:bg-danger-600 hover:bg-danger-600 dark:hover:bg-danger-700 text-white"
          >
            {{ 'Task.deleteSelected' | translate }} ({{ selectedTasks().length }})
          </app-button>
        }
      </div>
      <app-tasks-list-filters (filtersChange)="handleFiltersChange($event)" />
    </div>

    <!-- Templates definition outside of @switch -->
    <ng-template #statusTemplate let-task>
      <div class="flex items-center justify-center">
        @if (task.status) {
          <span
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            [style.background-color]="task.status.color"
            [style.color]="getContrastColor(task.status.color)"
          >
            {{ getStatusName(task.status) }}
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
        @if (task.assignedUsers && task.assignedUsers.length > 0) {
          <div class="flex flex-wrap gap-1">
            @for (user of task.assignedUsers; track user.id) {
              <span
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
              >
                {{ user.email }}
              </span>
            }
          </div>
        } @else {
          <span class="text-sm text-neutral-500 dark:text-neutral-400"> - </span>
        }
      </div>
    </ng-template>

    @if (tasksStateService.state() === listStateValue.ERROR && tasksStateService.tasks().length === 0) {
      <app-error-message [customMessage]="tasksStateService.error()?.message" />
    } @else {
      <app-table
        [data]="tasksStateService.tasks()"
        [config]="tableConfig()"
        [loading]="tasksStateService.state() === listStateValue.LOADING && tasksStateService.tasks().length === 0"
        [customTemplates]="customTemplates()"
        [initialSort]="currentSort()"
        (loadMore)="handleLoadMore()"
        (rowClick)="handleTaskClick($event)"
        (actionClick)="handleActionClick($event)"
        (sortChange)="handleSortChange($event)"
        (selectionChange)="handleSelectionChange($event)"
      />
    }
  `,
})
export class TaskListPageComponent implements OnInit, AfterViewInit {
  @ViewChild('statusTemplate', { static: false })
  statusTemplate!: TemplateRef<any>;
  @ViewChild('categoriesTemplate', { static: false })
  categoriesTemplate!: TemplateRef<any>;
  @ViewChild('assignedUsersTemplate', { static: false })
  assignedUsersTemplate!: TemplateRef<any>;

  protected readonly listStateValue = LOADING_STATE_VALUE;

  private readonly tasksService = inject(TasksService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly modalService = inject(ModalService);
  private readonly projectsService = inject(ProjectsService);
  private readonly translateService = inject(TranslateService);

  protected readonly tasksStateService = inject(TasksStateService);

  protected projectId = signal<string | null>(null);
  protected projectName = signal<string>('');
  protected projectIsPublic = signal<boolean>(false);
  protected selectedTasks = signal<Task[]>([]);
  protected customTemplates = signal<{ [key: string]: TemplateRef<any> }>({});
  protected currentSearchParams = signal<GetAllTasksSearchParams>({
    q: '',
    sortBy: 'dateCreation',
    orderBy: 'desc',
    page: 0,
    pageSize: 10,
  });

  protected currentSort = computed(() => {
    const params = this.currentSearchParams();
    if (params.sortBy === 'dateCreation' && params.orderBy === 'desc') {
      return null;
    }
    return {
      column: params.sortBy,
      direction: params.orderBy,
    };
  });

  protected readonly tableConfig = computed<TableConfig>(() => ({
    columns: this.getTableColumns(),
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
      },
      {
        key: 'delete',
        label: 'Basic.delete',
        icon: 'heroTrash',
        color: 'danger',
      },
    ],
    selectable: true,
    sortable: true,
    infiniteScroll: true,
    loadingMore: this.tasksStateService.isLoadingMore(),
    hover: true,
    striped: true,
    responsiveBreakpoint: 768,
    rowClassFunction: (row: Task) => this.getRowClassByPriority(row),
  }));

  ngOnInit(): void {
    this.initializeTaskList();
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
        truncate: true,
        maxLines: 2,
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
        key: 'dateCreation',
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
        key: 'dateModification',
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

  private getRowClassByPriority(task: Task): string {
    if (!task.priority) return '';

    switch (task.priority.code) {
      case 'high':
        return 'priority-high';
      case 'low':
        return 'priority-low';
      case 'medium':
      default:
        return '';
    }
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

  private initializeTaskList(): void {
    this.route.params
      .pipe(
        map(params => params['id']),
        distinctUntilChanged(),
        switchMap(projectId => {
          this.projectId.set(projectId);
          if (projectId) {
            this.loadProjectName(projectId);
          }
          const searchParams = getAllTasksSearchParams({
            q: '',
            sortBy: 'dateCreation',
            orderBy: 'desc',
            createdFrom: '',
            createdTo: '',
            updatedFrom: '',
            updatedTo: '',
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
    this.projectsService.getProjectById(+projectId).subscribe(project => {
      this.projectName.set(project.data.name);
      this.projectIsPublic.set(project.data.isPublic);
    });
  }

  private getAllTasks(searchParams: GetAllTasksSearchParams): Observable<void> {
    const projectId = this.projectId();
    if (!projectId) {
      this.tasksStateService.setTaskList([]);
      return EMPTY;
    }

    // Reset state for new search
    this.tasksStateService.resetState();

    return this.tasksService.getAllByProjectId(projectId, searchParams).pipe(
      map(response => {
        const tasks = response.data || { items: [], pagination: { total: 0, page: 0, pageSize: 10, totalPages: 0 } };
        this.tasksStateService.setTaskList(tasks.items);
        this.tasksStateService.setPagination(tasks.pagination);
      }),
      catchError(err => {
        if (err.error?.message) {
          this.notificationService.showNotification(err.error.message, NotificationTypeEnum.Error);
        } else {
          this.notificationService.showNotification(
            this.translateService.instant('Task.getAllError'),
            NotificationTypeEnum.Error,
          );
        }
        return EMPTY;
      }),
    );
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
              this.notificationService.showNotification(err.error.message, NotificationTypeEnum.Error);
            } else {
              this.notificationService.showNotification(
                this.translateService.instant('Task.loadMoreError'),
                NotificationTypeEnum.Error,
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
                this.tasksService.delete(event.row.id).subscribe(() => {
                  this.notificationService.showNotification(
                    this.translateService.instant('Task.deleteSuccess'),
                    NotificationTypeEnum.Success,
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
    const sortByMapping: { [key: string]: string } = {
      dateCreation: 'dateCreation',
      dateModification: 'dateModification',
      description: 'description',
      id: 'id',
    };

    const backendSortBy = event.column === '' ? 'dateCreation' : sortByMapping[event.column] || 'dateCreation';

    const currentParams = this.currentSearchParams();
    const searchParams = {
      ...currentParams,
      sortBy: backendSortBy as 'dateCreation' | 'dateModification' | 'description' | 'id',
      orderBy: event.direction,
      page: 0, // Reset to first page when sorting
    };

    this.currentSearchParams.set(searchParams);
    this.getAllTasks(searchParams).subscribe();
  }

  protected handleSelectionChange(selectedTasks: Task[]): void {
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

  private performBatchDelete(selectedTasks: Task[]): void {
    const taskIds = selectedTasks.map(task => task.id);
    this.tasksService.batchDelete(taskIds).subscribe({
      next: () => {
        this.notificationService.showNotification(
          this.translateService.instant('Task.batchDeleteSuccess', { count: selectedTasks.length }),
          NotificationTypeEnum.Success,
        );
        this.selectedTasks.set([]);
        const currentParams = this.currentSearchParams();
        this.getAllTasks(currentParams).subscribe();
      },
      error: (err: any) => {
        if (err.error?.message) {
          this.notificationService.showNotification(err.error.message, NotificationTypeEnum.Error);
        } else {
          this.notificationService.showNotification(
            this.translateService.instant('Task.batchDeleteError'),
            NotificationTypeEnum.Error,
          );
        }
      },
    });
  }

  protected getStatusName(status: any): string {
    if (!status) return '';

    if (status.translations && Array.isArray(status.translations)) {
      const currentLang = this.translateService.getCurrentLang() || 'pl';
      const translation = status.translations.find((t: any) => t.lang === currentLang);
      if (translation?.name) {
        return translation.name;
      }
    }

    return status.name || `Status #${status.id}`;
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
}
