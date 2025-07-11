import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ProjectCategoryApiService } from '../project/data-access/project-category.api.service';
import { ProjectRoleApiService } from '../project/data-access/project-role.api.service';
import { ProjectStatusApiService } from '../project/data-access/project-status.api.service';
import { ProjectsApiService } from '../project/data-access/project.api.service';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { TextareaComponent } from '../shared/components/atoms/textarea-component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { EditableMultiSelectComponent } from '../shared/components/molecules/editable-multi-select.component';
import { InputFieldComponent } from '../shared/components/molecules/input-field.component';
import { SelectFieldComponent } from '../shared/components/molecules/select-field.component';
import { NotificationTypeEnum } from '../shared/enums/notification.enum';
import { NotificationService } from '../shared/services/notification.service';
import { TaskPriorityApiService } from './data-access/task-priority-api.service';
import { TasksService } from './data-access/task.service';
import { AddTaskDto } from './dtos/add-task.dto';

interface SelectOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    TitleComponent,
    TextareaComponent,
    EditableMultiSelectComponent,
    InputFieldComponent,
    SelectFieldComponent,
  ],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <app-title>
        @if (projectId()) {
          {{ 'Task.addTaskToProject' | translate }}
        } @else {
          {{ 'Task.addTask' | translate }}
        }
      </app-title>

      @if (loading()) {
        <div class="flex justify-center items-center min-h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      } @else {
        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="relative">
            <app-textarea
              id="description"
              [control]="descriptionControl"
              [placeholder]="'Task.taskDescriptionPlaceholder' | translate"
              [rows]="3"
            />
            <label for="description" class="absolute left-2 -top-2 text-xs text-text-secondary dark:text-dark-text-secondary bg-background-primary dark:bg-dark-background-primary px-1">
              {{ 'Task.taskDescription' | translate }} *
            </label>

            @if (fieldErrors['description']) {
              <div class="mt-1">
                @for (err of fieldErrors['description']; track err) {
                  <div class="text-danger-600 text-xs">{{ err }}</div>
                }
              </div>
            }
          </div>

          <div class="relative">
            <app-textarea
              id="additionalDescription"
              [control]="additionalDescriptionControl"
              [placeholder]="'Task.additionalDescriptionPlaceholder' | translate"
              [rows]="3"
            />
            <label for="additionalDescription" class="absolute left-2 -top-2 text-xs text-text-secondary dark:text-dark-text-secondary bg-background-primary dark:bg-dark-background-primary px-1">
              {{ 'Task.additionalDescription' | translate }}
            </label>

            @if (fieldErrors['additionalDescription']) {
              <div class="mt-1">
                @for (err of fieldErrors['additionalDescription']; track err) {
                  <div class="text-danger-600 text-xs">{{ err }}</div>
                }
              </div>
            }
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-input-field
              [control]="priceEstimationControl"
              id="priceEstimation"
              [label]="'Task.priceEstimation' | translate"
              type="number"
            />

            <app-input-field
              [control]="workedTimeControl"
              id="workedTime"
              [label]="'Task.workedTime' | translate"
              type="number"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <app-select-field
              [control]="priorityIdControl"
              id="priorityId"
              [label]="'Task.priority' | translate"
              [placeholder]="'Task.selectPriority' | translate"
              [options]="priorityOptions"
            />

            @if (projectId()) {
                <app-editable-multi-select
                  [dataArray]="categories()"
                  [maxSelectedItems]="10"
                  [id]="'categories'"
                  [placeholder]="'Task.categories' | translate"
                  formControlName="categoryIds"
                ></app-editable-multi-select>

              @if (projectUsers().length > 0) {
                  <app-editable-multi-select
                    [dataArray]="projectUsers()"
                    [maxSelectedItems]="20"
                    [id]="'assignedUsers'"
                    [placeholder]="'Task.assignedUsers' | translate"
                    formControlName="assignedUserIds"
                  ></app-editable-multi-select>
              } @else {
                <p class="text-sm text-text-muted dark:text-dark-text-muted italic">
                  {{ 'Task.noProjectUsers' | translate }}
                </p>
              }

              <app-select-field
                [control]="statusIdControl"
                id="statusId"
                [label]="'Task.status' | translate"
                [placeholder]="'Task.selectStatus' | translate"
                [options]="statusOptions"
              />
            }
          </div>

          <div class="mt-6">
            <app-select-field
              [control]="accessRoleControl"
              id="accessRole"
              [label]="'Task.accessRole' | translate"
              [placeholder]="'Task.selectAccessRole' | translate"
              [options]="accessRoleOptions"
            />
          </div>

          @if (error()) {
            <div class="p-4 bg-danger-50 border border-danger-200 rounded-md">
              <p class="text-danger-600 text-sm">{{ error() }}</p>
            </div>
          }

          <div class="flex justify-between items-center pt-6">
            <app-button
              type="button"
              (click)="onCancel()"
            >
              {{ 'Basic.cancel' | translate }}
            </app-button>

            <app-button
              type="submit"
              [disabled]="!taskForm.valid || submitting()"
            >
              @if (submitting()) {
                <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              }
              {{ 'Basic.save' | translate }}
            </app-button>
          </div>
        </form>
      }
    </div>
  `,
})
export class TaskFormPageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tasksService = inject(TasksService);
  private readonly projectsApiService = inject(ProjectsApiService);
  private readonly taskPriorityApiService = inject(TaskPriorityApiService);
  private readonly projectCategoryApiService = inject(ProjectCategoryApiService);
  private readonly projectRoleApiService = inject(ProjectRoleApiService);
  private readonly projectStatusApiService = inject(ProjectStatusApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly destroy$ = new Subject<void>();

  readonly projectId = signal<string | null>(null);
  readonly taskId = signal<string | null>(null);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly prioritiesRaw = signal<any[]>([]);
  readonly categoriesRaw = signal<any[]>([]);
  readonly statusesRaw = signal<any[]>([]);
  readonly accessRolesRaw = signal<any[]>([]);
  readonly priorities = signal<SelectOption[]>([]);
  readonly categories = signal<SelectOption[]>([]);
  readonly statuses = signal<SelectOption[]>([]);
  readonly accessRoles = signal<SelectOption[]>([]);
  readonly projectUsers = signal<SelectOption[]>([]);

  taskForm: FormGroup = this.fb.group({
    description: ['', [Validators.required]],
    additionalDescription: [''],
    priceEstimation: [0],
    workedTime: [0],
    accessRole: [null],
    priorityId: [null],
    statusId: [null],
    projectId: [null],
    categoryIds: [[]],
    assignedUserIds: [[]],
  });

  protected fieldErrors: Record<string, string[]> = {};

  get descriptionControl() {
    return this.taskForm.get('description') as FormControl;
  }
  get additionalDescriptionControl() {
    return this.taskForm.get('additionalDescription') as FormControl;
  }
  get priceEstimationControl() {
    return this.taskForm.get('priceEstimation') as FormControl;
  }
  get workedTimeControl() {
    return this.taskForm.get('workedTime') as FormControl;
  }
  get priorityIdControl() {
    return this.taskForm.get('priorityId') as FormControl;
  }
  get statusIdControl() {
    return this.taskForm.get('statusId') as FormControl;
  }
  get accessRoleControl() {
    return this.taskForm.get('accessRole') as FormControl;
  }

  get priorityOptions() {
    return this.priorities().map(p => ({ value: p.id, label: p.name }));
  }

  get statusOptions() {
    return this.statuses().map(s => ({ value: s.id, label: s.name }));
  }

  get accessRoleOptions() {
    return this.accessRoles().map(r => ({ value: r.id, label: r.name }));
  }

  ngOnInit(): void {
    const projectIdParam = this.route.snapshot.paramMap.get('id');
    const taskIdParam = this.route.snapshot.paramMap.get('taskId');
    this.projectId.set(projectIdParam);
    this.taskId.set(taskIdParam);

    if (projectIdParam) {
      this.taskForm.patchValue({ projectId: +projectIdParam });
    }

    this.loadOptions();
    this.setupLanguageSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSubmit(): void {
    if (!this.taskForm.valid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.fieldErrors = {};

    const formValue = this.taskForm.value;
    const currentProjectId = this.projectId();
    const currentTaskId = this.taskId();

    if (!currentProjectId) {
      this.error.set('Projekt jest wymagany dla wszystkich zadań');
      this.submitting.set(false);
      return;
    }

    const taskData: AddTaskDto = {
      description: formValue.description,
      additionalDescription: formValue.additionalDescription || undefined,
      priceEstimation: formValue.priceEstimation || undefined,
      workedTime: formValue.workedTime || undefined,
      accessRoleId: formValue.accessRole || undefined,
      priorityId: formValue.priorityId || undefined,
      categoryIds: formValue.categoryIds && formValue.categoryIds.length > 0 ? formValue.categoryIds : undefined,
      statusId: formValue.statusId || undefined,
      assignedUserIds: formValue.assignedUserIds && formValue.assignedUserIds.length > 0
        ? formValue.assignedUserIds
        : undefined,
      projectId: +currentProjectId,
    };

    if (currentTaskId) {
      this.updateTask(+currentTaskId, taskData);
    } else {
      this.createTask(taskData);
    }
  }

  protected onCancel(): void {
    const currentProjectId = this.projectId();
    if (currentProjectId) {
      this.router.navigate(['/projects', currentProjectId, 'tasks']).then();
    } else {
      this.router.navigate(['/projects']).then();
    }
  }

  private setupLanguageSubscription(): void {
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateOptionsForCurrentLang();
      });
  }

  private loadOptions(): void {
    const currentProjectId = this.projectId();

    this.taskPriorityApiService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: prioritiesRes => {
          this.prioritiesRaw.set(prioritiesRes.data || []);
          this.updateOptionsForCurrentLang();
        },
        error: error => {
          console.error('Error loading priorities:', error);
          this.error.set('Błąd podczas ładowania priorytetów');
        },
      });

    this.projectRoleApiService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: accessRolesRes => {
          this.accessRolesRaw.set(accessRolesRes.data || []);
          this.updateOptionsForCurrentLang();
        },
        error: error => {
          console.error('Error loading access roles:', error);
          this.error.set('Błąd podczas ładowania ról dostępu');
        },
      });

    if (currentProjectId) {
      this.projectCategoryApiService.getByProjectId(+currentProjectId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: categoriesRes => {
            this.categoriesRaw.set(categoriesRes.data || []);
            this.updateOptionsForCurrentLang();
          },
          error: error => {
            console.error('Error loading categories:', error);
            this.error.set('Błąd podczas ładowania kategorii');
          },
        });

      this.projectStatusApiService.getByProjectId(+currentProjectId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: statusesRes => {
            this.statusesRaw.set(statusesRes.data || []);
            this.updateOptionsForCurrentLang();
          },
          error: error => {
            console.error('Error loading statuses:', error);
            this.error.set('Błąd podczas ładowania statusów');
          },
        });

      this.projectsApiService.getProjectUsers(+currentProjectId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: usersRes => {
            this.projectUsers.set(usersRes.data || []);
          },
          error: error => {
            console.error('Error loading project users:', error);
            this.error.set('Błąd podczas ładowania użytkowników projektu');
          },
        });

      const taskIdParam = this.taskId();
      if (taskIdParam) {
        this.loadTaskData(+taskIdParam);
      } else {
        this.loading.set(false);
      }
    } else {
      this.loading.set(false);
    }
  }

  private loadTaskData(taskId: number): void {
    this.tasksService.getOne(taskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          const data = response.data;
          this.taskForm.patchValue({
            description: data.description,
            additionalDescription: data.additionalDescription || '',
            priceEstimation: data.priceEstimation || 0,
            workedTime: data.workedTime || 0,
            accessRole: data.accessRole?.id || null,
            priorityId: data.priority?.id || null,
            statusId: data.status?.id || null,
            categoryIds: data.categories?.map((c: any) => c.id) || [],
            assignedUserIds: data.assignedUsers?.map((u: any) => u.id) || [],
          });
          this.loading.set(false);
        },
        error: error => {
          console.error('Error loading task data:', error);
          this.error.set('Błąd podczas ładowania danych zadania');
          this.loading.set(false);
        },
      });
  }

  private createTask(taskData: AddTaskDto): void {
    this.tasksService.add(taskData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.notificationService.showNotification(
            this.translateService.instant('Task.addSuccess'),
            NotificationTypeEnum.Success,
          );

          const newTaskId = response?.data?.id;
          const currentProjectId = this.projectId();

          if (newTaskId) {
            this.router.navigate(['/projects', currentProjectId, 'tasks', newTaskId]).then();
          } else {
            this.router.navigate(['/projects', currentProjectId, 'tasks']).then();
          }
        },
        error: error => {
          console.log('createTask error callback:', error);
          this.handleSubmissionError(error);
        },
        complete: () => {
          this.submitting.set(false);
        },
      });
  }

  private updateTask(taskId: number, taskData: AddTaskDto): void {
    const { projectId, ...updateData } = taskData;

    this.tasksService.update(taskId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.notificationService.showNotification(
            this.translateService.instant('Task.updateSuccess'),
            NotificationTypeEnum.Success,
          );

          const updatedTask = response?.data;
          const projectIdToUse = updatedTask?.project?.id || this.projectId();
          const taskIdToUse = updatedTask?.id || taskId;

          if (projectIdToUse && taskIdToUse) {
            this.router.navigate(['/projects', projectIdToUse, 'tasks', 'details', taskIdToUse]).then();
          } else {
            this.router.navigate(['/projects']).then();
          }
        },
        error: error => {
          console.log('updateTask error callback:', error);
          this.handleSubmissionError(error);
        },
        complete: () => {
          this.submitting.set(false);
        },
      });
  }

  private handleSubmissionError(error: any): void {
    const messages = error?.error?.errors?.message ?? [];
    if (Array.isArray(messages) && messages.length > 0) {
      Object.keys(this.fieldErrors).forEach(key => delete this.fieldErrors[key]);
      messages.forEach((errObj: any) => {
        if (errObj.field && Array.isArray(errObj.errors)) {
          this.fieldErrors[errObj.field] = errObj.errors;
        }
      });
      this.cdr.markForCheck();
      this.error.set(null);
    } else {
      const errorMessage = error?.error?.errors?.error
        || error?.error?.message
        || error?.message
        || 'Wystąpił błąd';
      this.error.set(errorMessage);
      this.notificationService.showNotification(
        errorMessage,
        NotificationTypeEnum.Error,
      );
    }
    this.submitting.set(false);
  }

  private updateOptionsForCurrentLang(): void {
    const lang = this.translateService.currentLang || 'pl';

    this.priorities.set((this.prioritiesRaw() || []).map((item: any) => ({
      id: item.id,
      name: (item.translations?.find((t: any) => t.lang === lang)?.name)
        || item.translations?.[0]?.name
        || item.name || '',
    })));

    this.categories.set((this.categoriesRaw() || []).map((item: any) => ({
      id: item.id,
      name: (item.translations?.find((t: any) => t.lang === lang)?.name)
        || item.translations?.[0]?.name
        || item.name || '',
    })));

    this.statuses.set((this.statusesRaw() || []).map((item: any) => ({
      id: item.id,
      name: (item.translations?.find((t: any) => t.lang === lang)?.name)
        || item.translations?.[0]?.name
        || item.name || '',
    })));

    this.accessRoles.set((this.accessRolesRaw() || []).map((item: any) => ({
      id: item.id,
      name: (item.translations?.find((t: any) => t.lang === lang)?.name)
        || item.translations?.[0]?.name
        || item.name || '',
    })));
  }
}
