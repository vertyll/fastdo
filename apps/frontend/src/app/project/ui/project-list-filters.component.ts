import { Component, DestroyRef, OnInit, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FilterGroupComponent } from 'src/app/shared/components/organisms/filter-group.component';
import { TranslatableOptionItem, TranslationItem } from 'src/app/shared/defs/common.defs';
import { PROJECT_LIST_FILTERS, ProjectListFiltersConfig } from 'src/app/shared/defs/filter.defs';
import { ProjectTypeService } from '../data-access/project-type.service';

@Component({
  selector: 'app-projects-list-filters',
  imports: [ReactiveFormsModule, FilterGroupComponent],
  template: ` <app-filter-group [filters]="filters" [type]="'projects'" (filterChange)="onFiltersChange($event)" /> `,
})
export class ProjectsListFiltersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly projectTypeService = inject(ProjectTypeService);

  protected readonly filtersChange = output<ProjectListFiltersConfig>();

  protected filters = PROJECT_LIST_FILTERS;
  protected projectTypesRaw: TranslatableOptionItem[] = [];

  ngOnInit(): void {
    this.getProjectTypes();
    this.setupLanguageSubscription();
  }

  protected onFiltersChange(filters: Record<string, unknown>): void {
    this.filtersChange.emit(filters as unknown as ProjectListFiltersConfig);
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
    this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updateProjectTypeOptionsForCurrentLang();
    });
  }

  private updateProjectTypeOptionsForCurrentLang(): void {
    const lang = this.translateService.getCurrentLang() || 'pl';
    const typeFilter = this.filters.find(filter => filter.formControlName === 'typeIds');
    if (!typeFilter) return;

    typeFilter.multiselectOptions = (this.projectTypesRaw || []).map(item => ({
      id: item.id,
      name: this.getLocalizedName(item, lang),
    }));
  }

  private getLocalizedName(item: TranslatableOptionItem, lang: string): string {
    return (
      item.translations?.find((translation: TranslationItem) => translation.lang === lang)?.name ||
      item.translations?.[0]?.name ||
      item.name ||
      ''
    );
  }
}
