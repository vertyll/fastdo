import {
  Component,
  Input,
  booleanAttribute,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { LIST_STATE_VALUE } from '../shared/types/list-state.type';
import {
  TasksListFiltersComponent,
  TasksListFiltersFormValue,
} from './ui/task-list-filters.component';
import { getAllTasksSearchParams } from './data-access/task-filters.adapter';
import { NgIconComponent } from '@ng-icons/core';
import { AppConfigStateService } from '../config/config.state.service';
import { GetAllTasksSearchParams } from './data-access/task.api.service';
import { AsyncPipe } from '@angular/common';
import { TasksListComponent } from './ui/task-list.component';
import { TasksKanbanViewComponent } from './ui/task-kanban.component';
import {
  TasksListViewMode,
  TasksListViewModeComponent,
} from './ui/task-list-view-mode.component';
import { TasksService } from './data-access/task.service';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map, switchMap } from 'rxjs';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NotificationType } from 'src/app/shared/enums/notification.enum';
import { ProjectsService } from 'src/app/project/data-access/project.service';
import { TasksStateService } from './data-access/task.state.service';
import { SubmitTextComponent } from 'src/app/shared/components/submit-text.component';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [
    TasksListComponent,
    SubmitTextComponent,
    TasksListFiltersComponent,
    NgIconComponent,
    TasksKanbanViewComponent,
    TasksListViewModeComponent,
    AsyncPipe,
  ],
  template: `
    <div class="flex flex-col gap-4">
      @if (!projectName) {
        <h2 class="text-2xl font-bold mb-4">All tasks</h2>
      } @else {
        <h2 class="text-2xl font-bold mb-4">
          Tasks for project: {{ projectName }}
        </h2>
      }
      <app-submit-text (submitText)="addTask($event)" />
      <app-tasks-list-filters (filtersChange)="handleFiltersChange($event)" />
    </div>

    <div class="how-to-use-section">
      <button (click)="showHowToUse = !showHowToUse">
        <span class="font-semibold">How to use</span>
        @if (showHowToUse) {
          <span>[-]</span>
        } @else {
          <span>[+]</span>
        }
      </button>

      @if (showHowToUse) {
        <div>
          <p>Change name: double click to edit task name</p>
          <p>Change name without saving: press esc</p>
          <p>Change status: click on the task</p>
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

    <p>Urgent tasks count: {{ tasksStateService.urgentCount() }}</p>
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
  protected showHowToUse = false;
  protected readonly configStateService = inject(AppConfigStateService);
  protected readonly tasksStateService = inject(TasksStateService);
  protected readonly $view = computed(
    () => this.configStateService.$value().tasksListView,
  );
  protected readonly listStateValue = LIST_STATE_VALUE;
  protected projectName!: string;

  ngOnInit(): void {
    if (this.view) {
      this.configStateService.updateTasksListView(this.view);
    }
    this.initializeTaskList();
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

  handleFiltersChange(filters: TasksListFiltersFormValue): void {
    const searchParams = getAllTasksSearchParams({
      ...filters,
      isUrgent: this.isUrgent,
    });
    this.getAllTasks(searchParams).subscribe();
  }

  addTask(name: string): void {
    this.tasksService.add(name, this.projectId).subscribe({
      next: () => {
        this.initializeTaskList();
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.notificationService.showNotification(
            err.error.message,
            NotificationType.error,
          );
        } else {
          this.notificationService.showNotification(
            'An error occurred while adding the task',
            NotificationType.error,
          );
        }
      },
      complete: () => {
        this.notificationService.showNotification(
          'Task added successfully',
          NotificationType.success,
        );
      },
    });
  }
}
