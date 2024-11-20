import { Component, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FilterGroupComponent } from 'src/app/shared/components/organisms/filter-group.component';
import {
  TASKS_LIST_FILTERS,
  TasksListFiltersConfig,
} from 'src/app/shared/types/filter.type';

@Component({
    selector: 'app-tasks-list-filters',
    imports: [ReactiveFormsModule, FilterGroupComponent],
    template: `
    <app-filter-group
      [filters]="filters"
      [type]="'tasks'"
      (filterChange)="onFiltersChange($event)"
    />
  `
})
export class TasksListFiltersComponent {
  readonly filtersChange = output<TasksListFiltersConfig>();

  protected filters = TASKS_LIST_FILTERS;

  protected onFiltersChange(filters: TasksListFiltersConfig): void {
    this.filtersChange.emit(filters);
  }
}
