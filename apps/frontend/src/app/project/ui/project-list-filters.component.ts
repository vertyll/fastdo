import { Component, OnInit, inject, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FilterGroupComponent } from 'src/app/shared/components/organisms/filter-group.component';
import { PROJECT_LIST_FILTERS, ProjectListFiltersConfig } from 'src/app/shared/types/filter.type';
import { ProjectTypeService } from '../data-access/project-type.service';

@Component({
  selector: 'app-projects-list-filters',
  imports: [ReactiveFormsModule, FilterGroupComponent],
  template: ` <app-filter-group [filters]="filters" [type]="'projects'" (filterChange)="onFiltersChange($event)" /> `,
})
export class ProjectsListFiltersComponent implements OnInit {
  private readonly translateService = inject(TranslateService);
  private readonly projectTypeService = inject(ProjectTypeService);

  protected readonly filtersChange = output<ProjectListFiltersConfig>();

  protected filters = PROJECT_LIST_FILTERS;
  protected projectTypesRaw: any[] = [];

  ngOnInit(): void {
    this.getProjectTypes();
    this.setupLanguageSubscription();
  }

  protected onFiltersChange(filters: Record<string, any>): void {
    this.filtersChange.emit(filters as ProjectListFiltersConfig);
  }

  private getProjectTypes(): void {
    this.projectTypeService.getAll().subscribe({
      next: types => {
        this.projectTypesRaw = types.data || [];
        this.updateProjectTypeOptionsForCurrentLang();
      },
      error: err => {
        console.error('Error fetching project types:', err);
      },
    });
  }

  private setupLanguageSubscription(): void {
    this.translateService.onLangChange.subscribe(() => {
      this.updateProjectTypeOptionsForCurrentLang();
    });
  }

  private updateProjectTypeOptionsForCurrentLang(): void {
    const lang = this.translateService.currentLang || 'pl';
    this.filters.find(filter => filter.formControlName === 'typeIds')!.multiselectOptions = (
      this.projectTypesRaw || []
    ).map((item: any) => ({
      id: item.id,
      name:
        item.translations?.find((t: any) => t.lang === lang)?.name || item.translations?.[0]?.name || item.name || '',
    }));
  }
}
