import {
  Component,
  Input,
  booleanAttribute,
  computed,
  inject,
} from '@angular/core';
import { LIST_STATE_VALUE } from '../../utils/list-state.type';
import { SubmitTextComponent } from '@ui/submit-text.component';
import {
  TasksListFiltersComponent,
  TasksListFiltersFormValue,
} from '../ui/task-list-filters.component';
import { getAllTasksSearchParams } from '../data-access/tasks-filters.adapter';
import { NgIconComponent } from '@ng-icons/core';
import { AppConfigStateService } from '../../config/config.state.service';
import { GetAllTasksSearchParams } from '../data-access/tasks.api.service';
import { AsyncPipe } from '@angular/common';
import { TasksListComponent } from '../ui/tasks-list.component';
import { TasksKanbanViewComponent } from '../ui/task-kanban.component';
import {
  TasksListViewMode,
  TasksListViewModeComponent,
} from '../ui/task-list-view-mode.component';
import { TasksService } from '../data-access/tasks.service';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map, switchMap } from 'rxjs';

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
    @if (listState$ | async; as listState) {
      <div class="flex flex-col items-center">
        <h2 class="text-2xl font-bold mb-4">Tasks</h2>
        <app-submit-text
          (submitText)="
            listState.state === listStateValue.SUCCESS && addTask($event)
          "
        />
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

      @switch (listState.state) {
        @case (listStateValue.SUCCESS) {
          @if ($view() === 'list') {
            <app-tasks-list class="block mt-4" [tasks]="listState.results" />
          } @else {
            <app-tasks-kanban-view [tasks]="listState.results" />
          }
        }
        @case (listStateValue.ERROR) {
          <p>
            {{ listState.error.message }}
          </p>
        }
        @case (listStateValue.LOADING) {
          <p>Loading...</p>
        }
      }
    }
  `,
})
export class TaskListPageComponent {
  @Input() projectId?: string;
  @Input() view?: TasksListViewMode;
  @Input({ transform: booleanAttribute }) isUrgent?: boolean;

  private tasksService = inject(TasksService);
  private route = inject(ActivatedRoute);
  protected showHowToUse = false;

  configStateService = inject(AppConfigStateService);
  $view = computed(() => this.configStateService.$value().tasksListView);
  listStateValue = LIST_STATE_VALUE;
  listState$ = this.tasksService.listState$;

  ngOnInit() {
    if (this.view) {
      this.configStateService.updateTasksListView(this.view);
    }

    this.initializeTaskList();
  }

  private initializeTaskList() {
    this.route.params
      .pipe(
        map((params) => params['projectId']),
        distinctUntilChanged(),
        switchMap((projectId) => {
          this.projectId = projectId;
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

  private getAllTasks(searchParams: GetAllTasksSearchParams) {
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
        console.log('Task added successfully');
        this.initializeTaskList();
      },
      error: (error) => {
        console.error('Error adding task:', error);
      },
    });
  }
}
