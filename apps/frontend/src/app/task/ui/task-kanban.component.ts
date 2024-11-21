import { Component, input } from '@angular/core';
import { TasksListComponent } from './task-list.component';
import { Task } from '../models/Task';
import { TranslateModule } from '@ngx-translate/core';

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
export class TasksKanbanViewComponent {
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
    this.todos = this.tasks().filter((task) => !task.isDone);
    this.tasksDone = this.tasks().filter((task) => task.isDone);
  }
}
