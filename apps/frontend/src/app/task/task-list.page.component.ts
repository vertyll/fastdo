import { Component, OnInit, booleanAttribute, computed, inject, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EMPTY, Observable, distinctUntilChanged, firstValueFrom, map, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProjectsService } from 'src/app/project/data-access/project.service';
import { NotificationType } from 'src/app/shared/enums/notification.enum';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { AppConfigStateService } from '../config/config.state.service';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { ButtonRole, ModalInputType } from '../shared/enums/modal.enum';
import { ModalService } from '../shared/services/modal.service';
import { TasksListFiltersConfig } from '../shared/types/filter.type';
import { LIST_STATE_VALUE, ListState } from '../shared/types/list-state.type';
import { getAllTasksSearchParams } from './data-access/task-filters.adapter';
import { GetAllTasksSearchParams } from './data-access/task.api.service';
import { TasksService } from './data-access/task.service';
import { TasksStateService } from './data-access/task.state.service';
import { AddTaskDto } from './dtos/add-task.dto';
import { Task } from './models/Task';
import { TasksKanbanViewComponent } from './ui/task-kanban.component';
import { TasksListFiltersComponent } from './ui/task-list-filters.component';
import { TasksListViewMode, TasksListViewModeComponent } from './ui/task-list-view-mode.component';
import { TasksListComponent } from './ui/task-list.component';
import { TaskNameValidator } from './validators/task-name.validator';

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
  ],
  template: `
    <div class="flex flex-col gap-4">
      @if (!projectName) {
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
          : {{ projectName }}
        </app-title>
      }
      <app-button (click)="openAddTaskModal()">
        {{ 'Task.addTask' | translate }}
      </app-button>
      <app-tasks-list-filters (filtersChange)="handleFiltersChange($event)"/>
    </div>

    <div class="border border-gray-300 p-2 w-36 rounded-lg flex items-center">
      <div
        class="flex items-center gap-1.5 cursor-help"
        [matTooltip]="getHelpText()"
        matTooltipPosition="right"
      >
        <span class="font-semibold">{{ 'Task.howToUse' | translate }}</span>
        <span class="text-sm text-gray-400 hover:text-gray-600">[?]</span>
      </div>
    </div>

    <app-tasks-list-view-mode
      [$view]="$view()"
      (updateTasksListView)="configStateService.updateTasksListView($event)"
    />

    <p class="mb-4">
      {{ 'Task.urgentTaskCount' | translate }}:
      <span class="text-orange-500 font-semibold">
        {{ tasksStateService.urgentCount() }}
      </span>
    </p>

    @switch (listState.state) {
      @case (listStateValue.SUCCESS) {
        @if ($view() === 'list') {
          <app-tasks-list
            class="block mt-4"
            [tasks]="listState.results"
          />
        } @else {
          <app-tasks-kanban-view
            [tasks]="listState.results"
          />
        }
      }
      @case (listStateValue.ERROR) {
        <app-error-message [customMessage]="listState.error.message"/>
      }
      @case (listStateValue.LOADING) {
        <p class="text-gray-600">{{ 'Basic.loading' | translate }}</p>
      }
    }
  `,
})
export class TaskListPageComponent implements OnInit {
  readonly projectId = input<string>();
  readonly view = input<TasksListViewMode>();
  readonly isUrgent = input<boolean, unknown>(undefined, { transform: booleanAttribute });

  protected readonly listStateValue = LIST_STATE_VALUE;
  protected listState: ListState<Task> = { state: LIST_STATE_VALUE.IDLE };

  private readonly tasksService = inject(TasksService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly projectsService = inject(ProjectsService);
  private readonly taskNameValidator = inject(TaskNameValidator);
  private readonly translateService = inject(TranslateService);
  private readonly modalService = inject(ModalService);

  protected readonly configStateService = inject(AppConfigStateService);
  protected readonly tasksStateService = inject(TasksStateService);
  protected readonly $view = computed(
    () => this.configStateService.$value().tasksListView,
  );
  protected projectName!: string;

  ngOnInit(): void {
    const view = this.view();
    if (view) {
      this.configStateService.updateTasksListView(view);
    }
    this.initializeTaskList();
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
      isUrgent: this.isUrgent(),
    });
    this.getAllTasks(searchParams).subscribe();
  }

  protected openAddTaskModal(): void {
    this.modalService.present({
      title: this.translateService.instant('Task.addTask'),
      inputs: [
        {
          id: 'name',
          type: ModalInputType.Textarea,
          required: true,
          label: this.translateService.instant('Task.taskName'),
        },
        {
          id: 'isDone',
          type: ModalInputType.Checkbox,
          required: false,
          label: this.translateService.instant('Task.isCompleted'),
        },
        {
          id: 'isUrgent',
          type: ModalInputType.Checkbox,
          required: false,
          label: this.translateService.instant('Task.isUrgent'),
        },
      ],
      buttons: [
        {
          role: ButtonRole.Cancel,
          text: this.translateService.instant('Basic.cancel'),
        },
        {
          role: ButtonRole.Ok,
          text: this.translateService.instant('Basic.save'),
          handler: (data: AddTaskDto) => this.addTask(data),
        },
      ],
    });
  }

  protected async addTask(data: AddTaskDto): Promise<boolean> {
    const validation = this.taskNameValidator.validateTaskName(data.name);
    if (!validation.isValid) {
      this.modalService.updateConfig({
        error: validation.error,
      });
      return false;
    }

    const projectId = this.projectId();
    if (projectId) {
      data.projectId = +projectId;
    }

    try {
      await firstValueFrom(this.tasksService.add(data));
      this.initializeTaskList();
      this.notificationService.showNotification(
        this.translateService.instant('Task.addSuccess'),
        NotificationType.success,
      );
      return true;
    } catch (err: any) {
      const errorMessage = err.error?.message || this.translateService.instant('Task.addError');

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

  private initializeTaskList(): void {
    this.route.params
      .pipe(
        map(params => params['projectId']),
        distinctUntilChanged(),
        switchMap(projectId => {
          if (projectId) {
            this.loadProjectName(projectId);
          }
          const searchParams = getAllTasksSearchParams({
            q: '',
            status: 'ALL',
            sortBy: 'dateCreation',
            isUrgent: this.isUrgent(),
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

  private loadProjectName(projectId: number): void {
    this.projectsService.getProjectById(projectId).subscribe(project => {
      this.projectName = project.name;
    });
  }

  private getAllTasks(searchParams: GetAllTasksSearchParams): Observable<void> {
    this.listState = { state: LIST_STATE_VALUE.LOADING };

    const projectId = this.projectId();
    const request$ = projectId
      ? this.tasksService.getAllByProjectId(projectId, searchParams)
      : this.tasksService.getAll(searchParams);

    return request$.pipe(
      map(response => {
        const tasks = response.body || [];
        this.listState = {
          state: LIST_STATE_VALUE.SUCCESS,
          results: tasks,
        };
        this.tasksStateService.setTaskList(tasks);
      }),
      catchError(err => {
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
            this.translateService.instant('Task.getAllError'),
            NotificationType.error,
          );
        }
        return EMPTY;
      }),
    );
  }
}
