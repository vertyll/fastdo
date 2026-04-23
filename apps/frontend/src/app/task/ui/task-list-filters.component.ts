import { Component, DestroyRef, OnInit, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProjectCategoryService } from 'src/app/project/data-access/project-category.service';
import { ProjectStatusService } from 'src/app/project/data-access/project-status.service';
import { ProjectUserRoleService } from 'src/app/project/data-access/project-user-role.service';
import { SpinnerComponent } from 'src/app/shared/components/atoms/spinner.component';
import { FilterGroupComponent } from 'src/app/shared/components/organisms/filter-group.component';
import { TASKS_LIST_FILTERS, TasksListFiltersConfig } from 'src/app/shared/defs/filter.defs';
import { TaskPriorityService } from '../data-access/task-priority.service';

@Component({
  selector: 'app-tasks-list-filters',
  imports: [ReactiveFormsModule, FilterGroupComponent, SpinnerComponent],
  template: `
    @if (isLoading()) {
      <div class="flex justify-center py-4">
        <app-spinner />
      </div>
    } @else {
      <app-filter-group [filters]="filters" [type]="'tasks'" (filterChange)="onFiltersChange($event)" />
    }
  `,
})
export class TasksListFiltersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly taskPriorityService = inject(TaskPriorityService);
  private readonly projectStatusService = inject(ProjectStatusService);
  private readonly projectCategoryService = inject(ProjectCategoryService);
  private readonly projectUserRoleService = inject(ProjectUserRoleService);
  private readonly route = inject(ActivatedRoute);

  protected readonly filtersChange = output<TasksListFiltersConfig>();

  protected filters = TASKS_LIST_FILTERS;
  protected readonly isLoading = signal(true);
  private prioritiesRaw: any[] = [];
  private statusesRaw: any[] = [];
  private categoriesRaw: any[] = [];

  private projectId: number | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.projectId = idParam ? Number(idParam) : null;
    this.loadInitialFilterData();

    this.setupLanguageSubscription();
  }

  protected onFiltersChange(filters: Record<string, any>): void {
    this.filtersChange.emit(filters as TasksListFiltersConfig);
  }

  private loadInitialFilterData(): void {
    const priorities$ = this.taskPriorityService.getAll().pipe(
      catchError(err => {
        console.error('Error fetching task priorities:', err);
        return of({ data: [] } as any);
      }),
    );
    const statuses$ =
      this.projectId !== null
        ? this.projectStatusService.getByProjectId(this.projectId).pipe(
            catchError(err => {
              console.error('Error fetching project statuses:', err);
              return of({ data: [] } as any);
            }),
          )
        : of({ data: [] } as any);
    const categories$ =
      this.projectId !== null
        ? this.projectCategoryService.getByProjectId(this.projectId).pipe(
            catchError(err => {
              console.error('Error fetching project categories:', err);
              return of({ data: [] } as any);
            }),
          )
        : of({ data: [] } as any);
    const users$ =
      this.projectId !== null
        ? this.projectUserRoleService.getUsersInProject(this.projectId).pipe(
            catchError(err => {
              console.error('Error fetching users in project:', err);
              return of({ data: [] } as any);
            }),
          )
        : of({ data: [] } as any);

    forkJoin({ priorities: priorities$, statuses: statuses$, categories: categories$, users: users$ })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ priorities, statuses, categories, users }) => {
        this.prioritiesRaw = priorities.data || [];
        this.statusesRaw = statuses.data || [];
        this.categoriesRaw = categories.data || [];

        const userFilter = this.filters.find(filter => filter.formControlName === 'assignedUserIds');
        if (userFilter) {
          userFilter.multiselectOptions = (users.data || []).map((user: any) => ({
            id: user.user.id,
            name: user.user.email,
          }));
        }

        this.refreshLocalizedOptionsForCurrentLang();
        this.isLoading.set(false);
      });
  }

  private setupLanguageSubscription(): void {
    this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.refreshLocalizedOptionsForCurrentLang();
    });
  }

  private refreshLocalizedOptionsForCurrentLang(): void {
    const lang = this.translateService.getCurrentLang() || 'pl';
    this.updateLocalizedOptions('priorityIds', this.prioritiesRaw, lang);
    this.updateLocalizedOptions('statusIds', this.statusesRaw, lang);
    this.updateLocalizedOptions('categoryIds', this.categoriesRaw, lang);
  }

  private updateLocalizedOptions(formControlName: string, items: any[], lang: string): void {
    const filter = this.filters.find(item => item.formControlName === formControlName);
    if (!filter) return;

    filter.multiselectOptions = (items || []).map((item: any) => ({
      id: item.id,
      name: item.translations?.find((t: any) => t.lang === lang)?.name,
    }));
  }
}
