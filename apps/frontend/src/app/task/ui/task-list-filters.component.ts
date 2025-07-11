import { Component, OnInit, inject, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ProjectCategoryApiService } from 'src/app/project/data-access/project-category.api.service';
import { ProjectStatusApiService } from 'src/app/project/data-access/project-status.api.service';
import { FilterGroupComponent } from 'src/app/shared/components/organisms/filter-group.component';
import { TASKS_LIST_FILTERS, TasksListFiltersConfig } from 'src/app/shared/types/filter.type';
import { TaskPriorityApiService } from '../data-access/task-priority-api.service';

@Component({
  selector: 'app-tasks-list-filters',
  imports: [ReactiveFormsModule, FilterGroupComponent],
  template: `
    <app-filter-group
      [filters]="filters"
      [type]="'tasks'"
      (filterChange)="onFiltersChange($event)"
    />
  `,
})
export class TasksListFiltersComponent implements OnInit {
  private readonly translateService = inject(TranslateService);
  private readonly taskPriorityApiService = inject(TaskPriorityApiService);
  private readonly projectStatusApiService = inject(ProjectStatusApiService);
  private readonly projectCategoryApiService = inject(ProjectCategoryApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly filtersChange = output<TasksListFiltersConfig>();

  protected filters = TASKS_LIST_FILTERS;
  private prioritiesRaw: any[] = [];
  private statusesRaw: any[] = [];
  private categoriesRaw: any[] = [];

  private projectId: number | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.projectId = idParam ? Number(idParam) : null;
    this.getPriorities();
    this.getStatuses();
    this.getCategories();
    this.setupLanguageSubscription();
  }

  protected onFiltersChange(filters: Record<string, any>): void {
    this.filtersChange.emit(filters as TasksListFiltersConfig);
  }

  private getPriorities(): void {
    this.taskPriorityApiService.getAll().subscribe({
      next: priorities => {
        this.prioritiesRaw = priorities.data || [];
        this.updatePriorityOptionsForCurrentLang();
      },
      error: err => {
        console.error('Error fetching task priorities:', err);
      },
    });
  }

  private getStatuses(): void {
    if (this.projectId === null) return;
    this.projectStatusApiService.getByProjectId(this.projectId).subscribe({
      next: statuses => {
        this.statusesRaw = statuses.data || [];
        this.updateStatusOptionsForCurrentLang();
      },
      error: err => {
        console.error('Error fetching project statuses:', err);
      },
    });
  }

  private getCategories(): void {
    if (this.projectId === null) return;
    this.projectCategoryApiService.getByProjectId(this.projectId).subscribe({
      next: categories => {
        this.categoriesRaw = categories.data || [];
        this.updateCategoryOptionsForCurrentLang();
      },
      error: err => {
        console.error('Error fetching project categories:', err);
      },
    });
  }

  private setupLanguageSubscription(): void {
    this.translateService.onLangChange.subscribe(() => {
      this.updatePriorityOptionsForCurrentLang();
      this.updateStatusOptionsForCurrentLang();
      this.updateCategoryOptionsForCurrentLang();
    });
  }

  private updatePriorityOptionsForCurrentLang(): void {
    const lang = this.translateService.currentLang || 'pl';
    this.filters.find(
      filter => filter.formControlName === 'priorityIds',
    )!.multiselectOptions = (this.prioritiesRaw || []).map((item: any) => ({
      id: item.id,
      name: item.translations?.find((t: any) => t.lang === lang)?.name,
    }));
  }

  private updateStatusOptionsForCurrentLang(): void {
    const lang = this.translateService.currentLang || 'pl';
    this.filters.find(
      filter => filter.formControlName === 'statusIds',
    )!.multiselectOptions = (this.statusesRaw || []).map((item: any) => ({
      id: item.id,
      name: item.translations?.find((t: any) => t.lang === lang)?.name,
    }));
  }

  private updateCategoryOptionsForCurrentLang(): void {
    const lang = this.translateService.currentLang || 'pl';
    this.filters.find(
      filter => filter.formControlName === 'categoryIds',
    )!.multiselectOptions = (this.categoriesRaw || []).map((item: any) => ({
      id: item.id,
      name: item.translations?.find((t: any) => t.lang === lang)?.name,
    }));
  }
}
