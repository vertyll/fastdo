import { Component, OnInit, inject, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ProjectCategoryService } from 'src/app/project/data-access/project-category.service';
import { ProjectStatusService } from 'src/app/project/data-access/project-status.service';
import { ProjectUserRoleService } from 'src/app/project/data-access/project-user-role.service';
import { FilterGroupComponent } from 'src/app/shared/components/organisms/filter-group.component';
import { TASKS_LIST_FILTERS, TasksListFiltersConfig } from 'src/app/shared/types/filter.type';
import { TaskPriorityService } from '../data-access/task-priority.service';

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
  private readonly taskPriorityService = inject(TaskPriorityService);
  private readonly projectStatusService = inject(ProjectStatusService);
  private readonly projectCategoryService = inject(ProjectCategoryService);
  private readonly projectUserRoleService = inject(ProjectUserRoleService);
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
    this.getUsersInProject();

    this.setupLanguageSubscription();
  }

  protected onFiltersChange(filters: Record<string, any>): void {
    this.filtersChange.emit(filters as TasksListFiltersConfig);
  }

  private getPriorities(): void {
    this.taskPriorityService.getAll().subscribe({
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
    this.projectStatusService.getByProjectId(this.projectId).subscribe({
      next: statuses => {
        this.statusesRaw = statuses.data || [];
        this.updateStatusOptionsForCurrentLang();
      },
      error: err => {
        console.error('Error fetching project statuses:', err);
      },
    });
  }

  private getUsersInProject(): void {
    if (this.projectId === null) return;
    this.projectUserRoleService.getUsersInProject(this.projectId).subscribe({
      next: users => {
        const userFilter = this.filters.find(filter => filter.formControlName === 'assignedUserIds');
        if (userFilter) {
          userFilter.multiselectOptions = users.data.map(user => ({
            id: user.user.id,
            name: user.user.email,
          }));
        }
      },
      error: err => {
        console.error('Error fetching users in project:', err);
      },
    });
  }

  private getCategories(): void {
    if (this.projectId === null) return;
    this.projectCategoryService.getByProjectId(this.projectId).subscribe({
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
