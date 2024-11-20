import {
  Component,
  Input,
  booleanAttribute,
  computed,
  inject,
  OnInit,
  input
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
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
import { ButtonRole, ModalInputType } from '../shared/enums/modal.enum';
import { TitleComponent } from '../shared/components/atoms/title.component';

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
          {{ 'Task.forProject' | translate }}
          : {{ projectName }}
        </app-title>
      }
      <app-button (click)="openAddTaskModal()">
        {{ 'Task.addTask' | translate }}
      </app-button>
      <app-tasks-list-filters (filtersChange)="handleFiltersChange($event)" />
    </div>

    <div class="border border-gray-300 p-2 max-w-lg rounded-lg">
      <button (click)="toggleHowToUse()">
        <span class="font-semibold">
          {{ 'Task.howToUse' | translate }}
        </span>
        @if (showHowToUse) {
          <span>[-]</span>
        } @else {
          <span>[+]</span>
        }
      </button>

      <div [@slideToggle]="showHowToUse ? 'open' : 'closed'">
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
    </div>

    <app-tasks-list-view-mode
      [$view]="$view()"
      (updateTasksListView)="configStateService.updateTasksListView($event)"
    />

    <p>
      {{ 'Task.urgentTaskCount' | translate }}:
      <span class="text-orange-500 font-semibold">{{
        tasksStateService.urgentCount()
      }}</span>
    </p>

    @if ($view() === 'list') {
      <app-tasks-list class="block mt-4" [tasks]="tasksStateService.tasks()" />
    } @else {
      <app-tasks-kanban-view [tasks]="tasksStateService.tasks()" />
    }
  `,
    animations: [
        trigger('slideToggle', [
            state('closed', style({
                height: '0px',
                overflow: 'hidden',
                opacity: 0,
            })),
            state('open', style({
                height: '*',
                opacity: 1,
            })),
            transition('closed <=> open', [animate('300ms ease-in-out')]),
        ]),
    ]
})
export class TaskListPageComponent implements OnInit {
  @Input() projectId?: string;
  readonly view = input<TasksListViewMode>();
  readonly isUrgent = input<boolean, unknown>(undefined, { transform: booleanAttribute });

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
    const view = this.view();
    if (view) {
      this.configStateService.updateTasksListView(view);
    }
    this.initializeTaskList();
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

    if (this.projectId) {
      data.projectId = +this.projectId;
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
      const errorMessage =
        err.error?.message || this.translateService.instant('Task.addError');

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

  protected toggleHowToUse(): void {
    this.showHowToUse = !this.showHowToUse;
  }
}
