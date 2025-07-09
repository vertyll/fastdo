import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
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
import { PriorityApiService } from './data-access/priority.api.service';
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
              <div class="lg:col-span-1">
                <app-editable-multi-select
                  [dataArray]="categories()"
                  [maxSelectedItems]="10"
                  [id]="'categories'"
                  [placeholder]="'Task.categories' | translate"
                  formControlName="categoryIds"
                ></app-editable-multi-select>
              </div>

              @if (projectUsers().length > 0) {
                <div class="lg:col-span-1">
                  <app-editable-multi-select
                    [dataArray]="projectUsers()"
                    [maxSelectedItems]="20"
                    [id]="'assignedUsers'"
                    [placeholder]="'Task.assignedUsers' | translate"
                    formControlName="assignedUserIds"
                  ></app-editable-multi-select>
                </div>
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
            <div class="p-4 bg-red-50 border border-red-200 rounded-md">
              <p class="text-red-600 text-sm">{{ error() }}</p>
            </div>
          }

          <div class="flex justify-between items-center pt-6">
            <app-button 
              type="button"
              variant="secondary"
              (click)="onCancel()"
            >
              {{ 'Basic.cancel' | translate }}
            </app-button>
            
            <app-button 
              type="submit"
              [disabled]="!taskForm.valid || submitting()"
              variant="primary"
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
  private readonly priorityApiService = inject(PriorityApiService);
  private readonly projectCategoryApiService = inject(ProjectCategoryApiService);
  private readonly projectRoleApiService = inject(ProjectRoleApiService);
  private readonly projectStatusApiService = inject(ProjectStatusApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);

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
  private langChangeSub: any;

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
  get categoryIdsControl() {
    return this.taskForm.get('categoryIds') as FormControl;
  }
  get assignedUserIdsControl() {
    return this.taskForm.get('assignedUserIds') as FormControl;
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

  async ngOnInit(): Promise<void> {
    const projectIdParam = this.route.snapshot.paramMap.get('id');
    const taskIdParam = this.route.snapshot.paramMap.get('taskId');
    this.projectId.set(projectIdParam);
    this.taskId.set(taskIdParam);

    if (projectIdParam) {
      this.taskForm.patchValue({ projectId: +projectIdParam });
    }

    await this.loadOptions();

    // Jeśli edycja zadania, pobierz dane i wypełnij formularz
    if (taskIdParam) {
      await this.loadTaskData(+taskIdParam);
    }

    this.langChangeSub = this.translateService.onLangChange.subscribe(() => {
      this.updateOptionsForCurrentLang();
    });
    this.loading.set(false);
  }

  ngOnDestroy(): void {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }

  protected async onSubmit(): Promise<void> {
    if (!this.taskForm.valid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    try {
      const formValue = this.taskForm.value;
      const currentProjectId = this.projectId();
      const currentTaskId = this.taskId();

      if (!currentProjectId) {
        this.error.set('Projekt jest wymagany dla wszystkich zadań');
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
        const { projectId, ...updateData } = taskData;
        const response = await firstValueFrom(this.tasksService.update(+currentTaskId, updateData));
        this.notificationService.showNotification(
          this.translateService.instant('Task.updateSuccess'),
          NotificationTypeEnum.Success,
        );
        // Pobierz projectId z odpowiedzi backendu jeśli jest, w ostateczności z sygnału
        const updatedTask = response?.data;
        const projectIdToUse = updatedTask?.project?.id || currentProjectId;
        const taskIdToUse = updatedTask?.id || currentTaskId;
        if (projectIdToUse && taskIdToUse) {
          this.router.navigate(['/projects', projectIdToUse, 'tasks', 'details', taskIdToUse]);
        } else {
          this.router.navigate(['/projects']);
        }
      } else {
        const response = await firstValueFrom(this.tasksService.add(taskData));
        this.notificationService.showNotification(
          this.translateService.instant('Task.addSuccess'),
          NotificationTypeEnum.Success,
        );
        // Przekieruj na szczegóły nowego zadania jeśli id jest dostępne
        const newTaskId = response?.data?.id;
        if (newTaskId) {
          this.router.navigate(['/projects', currentProjectId, 'tasks', newTaskId]);
        } else {
          this.router.navigate(['/projects', currentProjectId, 'tasks']);
        }
      }
    } catch (error: any) {
      console.error('Error creating/updating task:', error);
      const errorMessage = error.error?.message || this.translateService.instant('Task.addError');
      this.error.set(errorMessage);
      this.notificationService.showNotification(
        errorMessage,
        NotificationTypeEnum.Error,
      );
    } finally {
      this.submitting.set(false);
    }
  }

  private async loadTaskData(taskId: number): Promise<void> {
    try {
      this.loading.set(true);
      const response = await firstValueFrom(this.tasksService.getOne(taskId));
      const data = response.data;
      // Uzupełnij formularz danymi zadania
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
    } catch (error) {
      this.error.set('Błąd podczas ładowania danych zadania');
    } finally {
      this.loading.set(false);
    }
  }

  protected onCancel(): void {
    const currentProjectId = this.projectId();
    if (currentProjectId) {
      this.router.navigate(['/projects', currentProjectId, 'tasks']);
    } else {
      this.router.navigate(['/projects']);
    }
  }

  private async loadOptions(): Promise<void> {
    try {
      await Promise.all([
        this.loadPriorities(),
        this.loadAccessRoles(),
      ]);

      const currentProjectId = this.projectId();
      if (currentProjectId) {
        await Promise.all([
          this.loadCategories(+currentProjectId),
          this.loadStatuses(+currentProjectId),
          this.loadProjectUsers(+currentProjectId),
        ]);
      }
    } catch (error) {
      console.error('Error loading options:', error);
      this.error.set('Błąd podczas ładowania opcji formularza');
    }
  }

  private async loadPriorities(): Promise<void> {
    try {
      const response = await firstValueFrom(this.priorityApiService.getAll());
      if (response.data) {
        this.prioritiesRaw.set(response.data);
        this.updateOptionsForCurrentLang();
      }
    } catch (error) {
      console.error('Error loading priorities:', error);
    }
  }

  private async loadCategories(projectId: number): Promise<void> {
    try {
      const response = await firstValueFrom(this.projectCategoryApiService.getByProjectId(projectId));
      if (response.data) {
        this.categoriesRaw.set(response.data);
        this.updateOptionsForCurrentLang();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  private async loadStatuses(projectId: number): Promise<void> {
    try {
      const response = await firstValueFrom(this.projectStatusApiService.getByProjectId(projectId));
      if (response.data) {
        this.statusesRaw.set(response.data);
        this.updateOptionsForCurrentLang();
      }
    } catch (error) {
      console.error('Error loading statuses:', error);
    }
  }

  private async loadProjectUsers(projectId: number): Promise<void> {
    try {
      const response = await firstValueFrom(this.projectsApiService.getProjectUsers(projectId));
      if (response.data) {
        this.projectUsers.set(response.data);
      }
    } catch (error) {
      console.error('Error loading project users:', error);
    }
  }

  private async loadAccessRoles(): Promise<void> {
    try {
      const response = await firstValueFrom(this.projectRoleApiService.getAll());
      if (response.data) {
        this.accessRolesRaw.set(response.data);
        this.updateOptionsForCurrentLang();
      }
    } catch (error) {
      console.error('Error loading access roles:', error);
    }
  }
  private updateOptionsForCurrentLang(): void {
    const lang = this.translateService.currentLang || 'pl';
    // Priorytety
    this.priorities.set((this.prioritiesRaw() || []).map((item: any) => ({
      id: item.id,
      name: (item.translations?.find((t: any) => t.lang === lang)?.name) || item.translations?.[0]?.name || item.name
        || '',
    })));
    // Kategorie
    this.categories.set((this.categoriesRaw() || []).map((item: any) => ({
      id: item.id,
      name: (item.translations?.find((t: any) => t.lang === lang)?.name) || item.translations?.[0]?.name || item.name
        || '',
    })));
    // Statusy
    this.statuses.set((this.statusesRaw() || []).map((item: any) => ({
      id: item.id,
      name: (item.translations?.find((t: any) => t.lang === lang)?.name) || item.translations?.[0]?.name || item.name
        || '',
    })));
    // Role
    this.accessRoles.set((this.accessRolesRaw() || []).map((item: any) => ({
      id: item.id,
      name: (item.translations?.find((t: any) => t.lang === lang)?.name) || item.translations?.[0]?.name || item.name
        || '',
    })));
  }
}
