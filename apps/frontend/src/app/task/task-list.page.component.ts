import { Component, OnInit, booleanAttribute, computed, inject, input, signal } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EMPTY, Observable, distinctUntilChanged, map, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProjectsService } from 'src/app/project/data-access/project.service';
import { NotificationTypeEnum } from 'src/app/shared/enums/notification.enum';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { AppConfigStateService } from '../config/config.state.service';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { PaginatorComponent } from '../shared/components/atoms/paginator.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { PaginationMeta } from '../shared/types/api-response.type';
import { PaginationParams, TasksListFiltersConfig } from '../shared/types/filter.type';
import { LOADING_STATE_VALUE } from '../shared/types/list-state.type';
import { GetAllTasksSearchParams, TasksListViewMode } from '../shared/types/task.type';
import { getAllTasksSearchParams } from './data-access/task-filters.adapter';
import { TasksService } from './data-access/task.service';
import { TasksStateService } from './data-access/task.state.service';
import { TasksKanbanViewComponent } from './ui/task-kanban.component';
import { TasksListFiltersComponent } from './ui/task-list-filters.component';
import { TasksListViewModeComponent } from './ui/task-list-view-mode.component';
import { TasksListComponent } from './ui/task-list.component';

@Component({
  selector: 'app-task-list-page',
  imports: [
    TasksListComponent,
    TasksListFiltersComponent,
    TasksKanbanViewComponent,
    TasksListViewModeComponent,
    TranslateModule,
    ButtonComponent,
    TitleComponent,
    MatTooltipModule,
    ErrorMessageComponent,
    PaginatorComponent,
  ],
  template: `
    <div class="flex flex-col gap-4">
      @if (!projectName()) {
        <app-title>
          @if (isUrgent()) {
            {{ 'Task.urgentTasks' | translate }}
          } @else {
            {{ 'Task.title' | translate }}
          }
        </app-title>
      } @else {
        <app-title>
          {{ 'Task.taskForProject' | translate }}
          : {{ projectName() }}
        </app-title>
      }
      <app-button (click)="navigateToAddTask()">
        {{ 'Task.addTask' | translate }}
      </app-button>
      <app-tasks-list-filters (filtersChange)="handleFiltersChange($event)"/>
    </div>

    <div class="border border-border-primary dark:border-dark-border-primary p-2 w-36 rounded-lg flex items-center my-4">
      <div
        class="flex items-center gap-1.5 cursor-help"
        [matTooltip]="getHelpText()"
        matTooltipPosition="right"
      >
        <span class="font-semibold">{{ 'Task.howToUse' | translate }}</span>
        <span class="text-sm text-text-muted dark:text-dark-text-muted hover:text-text-secondary dark:hover:text-dark-text-secondary">[?]</span>
      </div>
    </div>

    <app-tasks-list-view-mode
      [$view]="$view()"
      (updateTasksListView)="configStateService.updateTasksListView($event)"
    />

    @switch (tasksStateService.state()) {
      @case (listStateValue.SUCCESS) {
        @if ($view() === 'list') {
          <app-tasks-list
            class="block mt-4"
            [tasks]="tasksStateService.tasks()"
          />
        } @else {
          <app-tasks-kanban-view
            [tasks]="tasksStateService.tasks()"
          />
        }
        <app-paginator
          [total]="tasksStateService.pagination().total"
          [pageSize]="tasksStateService.pagination().pageSize"
          [currentPage]="tasksStateService.pagination().page"
          (pageChange)="handlePageChange($event)"
        />
      }
      @case (listStateValue.ERROR) {
        <app-error-message [customMessage]="tasksStateService.error()?.message"/>
      }
      @case (listStateValue.LOADING) {
        <p class="text-text-secondary dark:text-dark-text-primary">{{ 'Basic.loading' | translate }}</p>
      }
    }
  `,
})
export class TaskListPageComponent implements OnInit {
  readonly view = input<TasksListViewMode>();
  readonly isUrgent = input<boolean, unknown>(undefined, { transform: booleanAttribute });

  protected readonly listStateValue = LOADING_STATE_VALUE;

  private readonly tasksService = inject(TasksService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly projectsService = inject(ProjectsService);
  private readonly translateService = inject(TranslateService);

  protected readonly configStateService = inject(AppConfigStateService);
  protected readonly tasksStateService = inject(TasksStateService);
  protected readonly $view = computed(
    () => this.configStateService.$value().tasksListView,
  );

  protected projectId = signal<string | null>(null);
  protected projectName = signal<string>('');

  ngOnInit(): void {
    const view = this.view();
    if (view) {
      this.configStateService.updateTasksListView(view);
    }
    this.initializeTaskList();
  }

  protected handlePageChange(event: PaginationParams): void {
    const { page, pageSize } = event;
    const currentPagination: PaginationMeta = this.tasksStateService.pagination();

    this.tasksStateService.setPagination({
      ...currentPagination,
      page,
    });

    const searchParams: GetAllTasksSearchParams = getAllTasksSearchParams({
      page,
      pageSize,
    });

    this.getAllTasks(searchParams).subscribe();
  }

  protected getHelpText(): string {
    return [
      this.translateService.instant('Task.changeNameDoc'),
      this.translateService.instant('Task.changeNameWithoutSaveDoc'),
      this.translateService.instant('Task.changeStatusDoc'),
    ].join('\n');
  }

  protected handleFiltersChange(filters: TasksListFiltersConfig): void {
    const searchParams = getAllTasksSearchParams({
      ...filters,
    });
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
          });
          return this.getAllTasks(searchParams);
        }),
      )
      .subscribe();
  }

  private loadProjectName(projectId: string): void {
    this.projectsService.getProjectById(+projectId).subscribe(project => {
      this.projectName.set(project.data.name);
    });
  }

  private getAllTasks(searchParams: GetAllTasksSearchParams): Observable<void> {
    const projectId = this.projectId();
    if (!projectId) {
      this.tasksStateService.setTaskList([]);
      return EMPTY;
    }

    return this.tasksService.getAllByProjectId(projectId, searchParams).pipe(
      map(response => {
        const tasks = response.data || { items: [], pagination: { total: 0, page: 0, pageSize: 10, totalPages: 0 } };
        this.tasksStateService.setTaskList(tasks.items);
        this.tasksStateService.setPagination(tasks.pagination);
      }),
      catchError(err => {
        if (err.error && err.error.message) {
          this.notificationService.showNotification(
            err.error.message,
            NotificationTypeEnum.Error,
          );
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
}
