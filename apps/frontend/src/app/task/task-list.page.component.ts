import {
  Component,
  Input,
  booleanAttribute,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { LIST_STATE_VALUE } from '../shared/types/list-state.type';
import { TasksListFiltersComponent } from './ui/task-list-filters.component';
import { getAllTasksSearchParams } from './data-access/task-filters.adapter';
import { AppConfigStateService } from '../config/config.state.service';
import { GetAllTasksSearchParams } from './data-access/task.api.service';
import { TasksListComponent } from './ui/task-list.component';
import { TasksKanbanViewComponent } from './ui/task-kanban.component';
import {
  TasksListViewMode,
  TasksListViewModeComponent,
} from './ui/task-list-view-mode.component';
import { TasksService } from './data-access/task.service';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, firstValueFrom, map, switchMap } from 'rxjs';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NotificationType } from 'src/app/shared/enums/notification.enum';
import { ProjectsService } from 'src/app/project/data-access/project.service';
import { TasksStateService } from './data-access/task.state.service';
import { TasksListFiltersConfig } from '../shared/types/filter.type';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TaskNameValidator } from './validators/task-name.validator';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { ModalService } from '../shared/services/modal.service';
import { AddTaskDto } from './dtos/add-task.dto';
import {
  ButtonRole,
  ModalInputType,
} from '../shared/interfaces/modal.interface';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [
    TasksListComponent,
    TasksListFiltersComponent,
    TasksKanbanViewComponent,
    TasksListViewModeComponent,
    TranslateModule,
    ButtonComponent,
  ],
  template: `
    <div class="flex flex-col gap-4">
      @if (!projectName) {
        <h2 class="text-2xl font-bold mb-4">
          {{ 'Task.title' | translate }}
        </h2>
      } @else {
        <h2 class="text-2xl font-bold mb-4">
          {{ 'Task.forProject' | translate }}
          : {{ projectName }}
        </h2>
      }
      <app-button (click)="openAddTaskModal()">
        {{ 'Task.addTask' | translate }}
      </app-button>
      <app-tasks-list-filters (filtersChange)="handleFiltersChange($event)" />
    </div>

    <div class="border border-gray-300 p-2 max-w-lg rounded-lg">
      <button (click)="showHowToUse = !showHowToUse">
        <span class="font-semibold">
          {{ 'Task.howToUse' | translate }}
        </span>
        @if (showHowToUse) {
          <span>[-]</span>
        } @else {
          <span>[+]</span>
        }
      </button>

      @if (showHowToUse) {
        <div>
          <p>
            {{ 'Task.changeNameDoc' | translate }}
          </p>
          <p>
            {{ 'Task.changeNameWithoutSaveDoc' | translate }}
          </p>
          <p>
            {{ 'Task.changeStatusDoc' | translate }}
          </p>
        </div>
      }
    </div>

    <app-tasks-list-view-mode
      [$view]="$view()"
      (updateTasksListView)="configStateService.updateTasksListView($event)"
    />

    @if ($view() === 'list') {
      <app-tasks-list class="block mt-4" [tasks]="tasksStateService.tasks()" />
    } @else {
      <app-tasks-kanban-view [tasks]="tasksStateService.tasks()" />
    }

    <p>
      {{ 'Task.urgentTaskCount' | translate }}:
      {{ tasksStateService.urgentCount() }}
    </p>
  `,
})
export class TaskListPageComponent implements OnInit {
  @Input() projectId?: string;
  @Input() view?: TasksListViewMode;
  @Input({ transform: booleanAttribute }) isUrgent?: boolean;

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
  protected readonly listStateValue = LIST_STATE_VALUE;
  protected showHowToUse: boolean = false;
  protected projectName!: string;
  private errorMessage: string = '';

  ngOnInit(): void {
    if (this.view) {
      this.configStateService.updateTasksListView(this.view);
    }
    this.initializeTaskList();
  }

  protected handleFiltersChange(filters: TasksListFiltersConfig): void {
    const searchParams = getAllTasksSearchParams({
      ...filters,
      isUrgent: this.isUrgent,
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
          handler: (data: AddTaskDto) => {
            this.addTask(data);
          },
        },
      ],
    });
  }

  protected addTask(data: AddTaskDto): void {
    const validation = this.taskNameValidator.validateTaskName(data.name);
    if (!validation.isValid) {
      this.notificationService.showNotification(
        validation.error!,
        NotificationType.error,
      );
      return;
    }

    if (this.projectId) {
      data.projectId = +this.projectId;
    }

    this.tasksService.add(data).subscribe({
      next: () => {
        this.initializeTaskList();
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
          this.notificationService.showNotification(
            this.errorMessage,
            NotificationType.error,
          );
        } else {
          this.errorMessage = this.translateService.instant('Task.addError');
          this.notificationService.showNotification(
            this.errorMessage,
            NotificationType.error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          this.translateService.instant('Task.addSuccess'),
          NotificationType.success,
        );
      },
    });
  }

  private initializeTaskList(): void {
    this.route.params
      .pipe(
        map((params) => params['projectId']),
        distinctUntilChanged(),
        switchMap((projectId) => {
          this.projectId = projectId;
          if (projectId) {
            this.loadProjectName(projectId);
          }
          const searchParams = getAllTasksSearchParams({
            q: '',
            status: 'ALL',
            sortBy: 'dateCreation',
            isUrgent: this.isUrgent,
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
    this.projectsService.getProjectById(projectId).subscribe((project) => {
      this.projectName = project.name;
    });
  }

  private getAllTasks(searchParams: GetAllTasksSearchParams): any {
    if (this.projectId) {
      return this.tasksService.getAllByProjectId(this.projectId, searchParams);
    } else {
      return this.tasksService.getAll(searchParams);
    }
  }
}
