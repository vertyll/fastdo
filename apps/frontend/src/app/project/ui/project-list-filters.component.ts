import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FilterGroupComponent } from 'src/app/shared/components/filter-group/filter-group.component';
import {
  PROJECT_LIST_FILTERS,
  ProjectListFiltersConfig,
} from 'src/app/shared/types/filter.types';

@Component({
  standalone: true,
  selector: 'app-projects-list-filters',
  imports: [ReactiveFormsModule, FilterGroupComponent],
  template: `
    <app-filter-group
      [filters]="filters"
      [type]="'projects'"
      (filterChange)="onFiltersChange($event)"
    />
  `,
})
export class ProjectsListFiltersComponent {
  @Output() filtersChange = new EventEmitter<ProjectListFiltersConfig>();

  protected filters = PROJECT_LIST_FILTERS;

  protected onFiltersChange(filters: ProjectListFiltersConfig): void {
    this.filtersChange.emit(filters);
  }
}
