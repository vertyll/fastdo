import { Component, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FilterGroupComponent } from 'src/app/shared/components/organisms/filter-group.component';
import { PROJECT_LIST_FILTERS, ProjectListFiltersConfig } from 'src/app/shared/types/filter.type';

@Component({
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
  readonly filtersChange = output<ProjectListFiltersConfig>();

  protected filters = PROJECT_LIST_FILTERS;

  protected onFiltersChange(filters: Record<string, any>): void {
    this.filtersChange.emit(filters as ProjectListFiltersConfig);
  }
}
