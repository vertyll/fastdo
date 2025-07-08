import { Component, OnChanges, OnInit, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Task } from '../models/Task';
import { TasksListComponent } from './task-list.component';

@Component({
  selector: 'app-tasks-kanban-view',
  imports: [TasksListComponent, TranslateModule],
  template: `
    <section class="flex gap-4">
      <div class="w-1/2">
        <p class="font-semibold text-xl">
          {{ 'Task.todo' | translate }}
        </p>
        <app-tasks-list class="block mt-4" [tasks]="todos" />
      </div>
      <div class="w-1/2">
        <p class="font-semibold text-xl">
          {{ 'Task.done' | translate }}
        </p>
        <app-tasks-list class="block mt-4" [tasks]="tasksDone" />
      </div>
    </section>
  `,
})
export class TasksKanbanViewComponent implements OnInit, OnChanges {
  readonly tasks = input<Task[]>([]);

  protected todos: Task[] = [];
  protected tasksDone: Task[] = [];

  ngOnInit() {
    this.filterTasks();
  }

  ngOnChanges() {
    this.filterTasks();
  }

  private filterTasks(): void {
    this.todos = this.tasks();
    this.tasksDone = [];
  }
}
