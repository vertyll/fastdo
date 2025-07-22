import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroDocument, heroTrash } from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ProjectCategoryService } from '../project/data-access/project-category.service';
import { ProjectRoleService } from '../project/data-access/project-role.service';
import { ProjectStatusService } from '../project/data-access/project-status.service';
import { ProjectsApiService } from '../project/data-access/project.api.service';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { TextareaComponent } from '../shared/components/atoms/textarea.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { EditableMultiSelectComponent } from '../shared/components/molecules/editable-multi-select.component';
import { FileUploadComponent, FileUploadItem } from '../shared/components/molecules/file-upload.component';
import { InputFieldComponent } from '../shared/components/molecules/input-field.component';
import { SelectFieldComponent } from '../shared/components/molecules/select-field.component';
import { ImageComponent } from '../shared/components/organisms/image.component';
import { NotificationTypeEnum } from '../shared/enums/notification.enum';
import { TaskPriorityEnum } from '../shared/enums/task-priority.enum';
import { NotificationService } from '../shared/services/notification.service';
import { TaskPriorityService } from './data-access/task-priority.service';
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
    FileUploadComponent,
    ImageComponent,
    ErrorMessageComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      heroTrash,
      heroDocument,
      heroArrowLeft,
    }),
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
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"
          ></div>
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
            <label
              for="description"
              class="absolute left-2 -top-2 text-xs text-text-secondary dark:text-dark-text-secondary bg-background-primary dark:bg-dark-background-primary px-1"
            >
              {{ 'Task.taskDescription' | translate }} *
            </label>

            <app-error-message [input]="descriptionControl" />
          </div>

          <div class="relative">
            <app-textarea
              id="additionalDescription"
              [control]="additionalDescriptionControl"
              [placeholder]="
                'Task.additionalDescriptionPlaceholder' | translate
              "
              [rows]="3"
            />
            <label
              for="additionalDescription"
              class="absolute left-2 -top-2 text-xs text-text-secondary dark:text-dark-text-secondary bg-background-primary dark:bg-dark-background-primary px-1"
            >
              {{ 'Task.additionalDescription' | translate }}
            </label>

            <app-error-message [input]="additionalDescriptionControl" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-input-field
              [control]="priceEstimationControl"
              id="priceEstimation"
              [label]="'Task.priceEstimation' | translate"
              type="number"
            />
            @if (fieldErrors['priceEstimation']) {
              <app-error-message
                [customMessage]="fieldErrors['priceEstimation'].join(', ')"
              />
            }

            <app-input-field
              [control]="workedTimeControl"
              id="workedTime"
              [label]="'Task.workedTime' | translate"
              type="number"
            />
            @if (fieldErrors['workedTime']) {
              <app-error-message
                [customMessage]="fieldErrors['workedTime'].join(', ')"
              />
            }
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <app-select-field
              [control]="priorityIdControl"
              id="priorityId"
              [label]="'Task.priority' | translate"
              [options]="priorityOptions"
            />
            @if (fieldErrors['priorityId']) {
              <app-error-message
                [customMessage]="fieldErrors['priorityId'].join(', ')"
              />
            }

            @if (projectId()) {
              <app-editable-multi-select
                [dataArray]="categories()"
                [maxSelectedItems]="10"
                [id]="'categories'"
                [placeholder]="'Task.categories' | translate"
                formControlName="categoryIds"
              ></app-editable-multi-select>
              @if (fieldErrors['categoryIds']) {
                <app-error-message
                  [customMessage]="fieldErrors['categoryIds'].join(', ')"
                />
              }

              @if (projectUsers().length > 0) {
                <app-editable-multi-select
                  [dataArray]="projectUsers()"
                  [maxSelectedItems]="20"
                  [id]="'assignedUsers'"
                  [placeholder]="'Task.assignedUsers' | translate"
                  formControlName="assignedUserIds"
                ></app-editable-multi-select>
                @if (fieldErrors['assignedUserIds']) {
                  <app-error-message
                    [customMessage]="fieldErrors['assignedUserIds'].join(', ')"
                  />
                }
              } @else {
                <p
                  class="text-sm text-text-muted dark:text-dark-text-muted italic"
                >
                  {{ 'Task.noProjectUsers' | translate }}
                </p>
              }

              <app-select-field
                [control]="statusIdControl"
                id="statusId"
                [label]="'Task.status' | translate"
                [options]="statusOptions"
              />
              @if (fieldErrors['statusId']) {
                <app-error-message
                  [customMessage]="fieldErrors['statusId'].join(', ')"
                />
              }
            }
          </div>

          <div class="mt-6">
            <app-select-field
              [control]="accessRoleControl"
              id="accessRole"
              [label]="'Task.accessRole' | translate"
              [options]="accessRoleOptions"
            />
            @if (fieldErrors['accessRole']) {
              <app-error-message
                [customMessage]="fieldErrors['accessRole'].join(', ')"
              />
            }
          </div>

          <!-- File Attachments -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              {{ 'Task.attachments' | translate }}
            </h3>

            <!-- Existing Attachments -->
            @if (existingAttachments().length > 0) {
              <div class="space-y-2">
                <h4
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ 'Task.existingAttachments' | translate }}
                </h4>
                <div class="flex flex-col gap-3">
                  @for (
                    attachment of existingAttachments();
                    track attachment.id
                  ) {
                    <div
                      class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-opacity duration-200"
                      [class.opacity-50]="attachment._markedForDelete"
                    >
                      <div class="flex items-center gap-3 flex-1 min-w-0">
                        <!-- Icon/Image -->
                        <div class="flex-shrink-0">
                          @if (isImage(attachment.filename)) {
                            <app-image
                              [initialUrl]="attachment.url || null"
                              [mode]="'preview'"
                              [format]="'square'"
                              [size]="'sm'"
                              class="w-10 h-10 object-cover rounded-md cursor-pointer"
                            />
                          } @else {
                            <ng-icon
                              name="heroDocument"
                              size="20"
                              class="text-blue-500"
                            ></ng-icon>
                          }
                        </div>

                        <!-- Tekst -->
                        <div class="min-w-0 flex-1">
                          <p
                            class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                          >
                            {{ attachment.originalName }}
                          </p>
                          <p class="text-xs text-gray-500 dark:text-gray-400">
                            {{ formatFileSize(attachment.size) }}
                          </p>
                        </div>
                      </div>

                      <!-- Delete/Undo Button -->
                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          (click)="removeExistingAttachment(attachment)"
                          class="p-1 rounded-md outline-none border-none"
                          [ngClass]="attachment._markedForDelete
                            ? 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100'
                            : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200'"
                          [title]="attachment._markedForDelete ? ('Basic.undo' | translate) : ('Basic.delete' | translate)"
                        >
                          <ng-icon *ngIf="!attachment._markedForDelete" name="heroTrash" size="16"></ng-icon>
                          <ng-icon *ngIf="attachment._markedForDelete" name="heroArrowLeft" size="16"></ng-icon>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- New Attachments Upload -->
            <div class="space-y-2">
              @if (taskId()) {
                <h4
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ 'Task.addNewAttachments' | translate }}
                </h4>
              }
              <div
                [class]="
                  getTotalAttachments() > maxAttachmentsLimit
                    ? 'border-2 border-red-500 rounded-md p-2'
                    : ''
                "
              >
                <app-file-upload
                  [multiple]="true"
                  [maxFiles]="getMaxNewFiles()"
                  [maxSizeBytes]="10485760"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  (filesChange)="onFilesChange($event)"
                />
              </div>
              @if (taskId()) {
                <p
                  class="text-xs text-gray-500 dark:text-gray-400"
                  [class]="
                    getTotalAttachments() > maxAttachmentsLimit
                      ? 'text-red-500'
                      : 'text-gray-500 dark:text-gray-400'
                  "
                >
                  {{
                    'Task.maxAttachmentsNote'
                      | translate
                        : {
                            max: maxAttachmentsLimit,
                            current: getTotalAttachments(),
                          }
                  }}
                </p>
              }
              @if (getTotalAttachments() > maxAttachmentsLimit) {
                <p class="text-xs text-red-500">
                  {{ 'Task.attachmentsLimitExceeded' | translate }}
                </p>
              }
              @if (fieldErrors['attachments']) {
                <app-error-message
                  [customMessage]="fieldErrors['attachments'].join(', ')"
                />
              }
            </div>
          </div>

          @if (error()) {
            <div class="p-4 bg-danger-50 border border-danger-200 rounded-md">
              <p class="text-danger-600 text-sm">{{ error() }}</p>
            </div>
          }

          <div class="flex justify-between items-center pt-6">
            <app-button type="button" (click)="onCancel()">
              {{ 'Basic.cancel' | translate }}
            </app-button>

            <app-button
              type="submit"
              [disabled]="
                !taskForm.valid ||
                submitting() ||
                getTotalAttachments() > maxAttachmentsLimit
              "
            >
              @if (submitting()) {
                <span
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                ></span>
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
  private readonly taskPriorityService = inject(TaskPriorityService);
  private readonly projectCategoryService = inject(ProjectCategoryService);
  private readonly projectRoleService = inject(ProjectRoleService);
  private readonly projectStatusService = inject(ProjectStatusService);
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
  readonly attachments = signal<FileUploadItem[]>([]);
  readonly existingAttachments = signal<any[]>([]);
  readonly attachmentsToDelete = signal<string[]>([]);

  protected readonly maxAttachmentsLimit = 4;

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
  return this.priorities().map((item: any) => ({
    value: item.id,
    label: item.name,
  }));
}

  get statusOptions() {
    return [
      { value: null, label: this.translateService.instant('Basic.none') },
      ...this.statuses().map(s => ({ value: s.id, label: s.name })),
    ];
  }

  get accessRoleOptions() {
    return [
      { value: null, label: this.translateService.instant('Basic.none') },
      ...this.accessRoles().map(r => ({ value: r.id, label: r.name })),
    ];
  }

  ngOnInit(): void {
    const projectIdParam = this.route.snapshot.paramMap.get('id');
    const taskIdParam = this.route.snapshot.paramMap.get('taskId');
    this.projectId.set(projectIdParam);
    this.taskId.set(taskIdParam);

    if (projectIdParam) {
      this.taskForm.patchValue({ projectId: +projectIdParam });
    }

    this.taskForm.patchValue({ accessRole: null });
    this.taskForm.patchValue({ statusId: null });

    const mediumPriority = this.prioritiesRaw().find((p: any) => p.code === TaskPriorityEnum.MEDIUM);
    if (mediumPriority) {
      this.taskForm.patchValue({ priorityId: mediumPriority.id });
    } else {
      this.taskForm.patchValue({ priorityId: null });
    }

    this.loadOptions();
    this.setupLanguageSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onFilesChange(files: FileUploadItem[]): void {
    const existingCount = this.existingAttachments().length;
    const maxNew = Math.max(0, this.maxAttachmentsLimit - existingCount);

    if (files.length > maxNew) {
      this.error.set(
        this.translateService.instant('Task.maxAttachmentsError', {
          max: this.maxAttachmentsLimit,
          current: existingCount + files.length,
        }),
      );
      const trimmedFiles = files.slice(0, maxNew);
      this.attachments.set(trimmedFiles);
      return;
    }

    this.attachments.set(files);
    this.error.set(null);
  }

  protected removeExistingAttachment(attachment: any): void {
    if (!attachment._markedForDelete) {
      attachment._markedForDelete = true;
      this.attachmentsToDelete.update(toDelete => [
        ...toDelete,
        attachment.id,
      ]);
    } else {
      attachment._markedForDelete = false;
      this.attachmentsToDelete.update(toDelete => toDelete.filter(id => id !== attachment.id));
    }
    this.existingAttachments.set([...this.existingAttachments()]);

    const totalAttachments = this.getTotalAttachments();
    if (totalAttachments <= this.maxAttachmentsLimit) {
      this.error.set(null);
    }
  }

  protected isImage(filename: string): boolean {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  protected getMaxNewFiles(): number {
    const maxTotal = this.maxAttachmentsLimit;
    const existing = this.existingAttachments().length;
    return Math.max(0, maxTotal - existing);
  }

  protected getTotalAttachments(): number {
    return this.existingAttachments().length + this.attachments().length;
  }

  protected onSubmit(): void {
    if (!this.taskForm.valid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const totalAttachments = this.getTotalAttachments();
    if (totalAttachments > this.maxAttachmentsLimit) {
      this.error.set(
        this.translateService.instant('Task.maxAttachmentsError', {
          max: this.maxAttachmentsLimit,
        }),
      );
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
      categoryIds: formValue.categoryIds && formValue.categoryIds.length > 0
        ? formValue.categoryIds
        : undefined,
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

    this.taskPriorityService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: prioritiesRes => {
          this.prioritiesRaw.set(prioritiesRes.data || []);
          this.updateOptionsForCurrentLang();
          const currentPriority = this.taskForm.get('priorityId')?.value;
          if (currentPriority == null) {
            const mediumPriorityRaw = (prioritiesRes.data || []).find((item: any) =>
              item.code === TaskPriorityEnum.MEDIUM
            );
            if (mediumPriorityRaw) {
              this.taskForm.patchValue({ priorityId: mediumPriorityRaw.id });
            }
          }
        },
        error: error => {
          console.error('Error loading priorities:', error);
          this.error.set('Błąd podczas ładowania priorytetów');
        },
      });

    this.projectRoleService
      .getAll()
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
      this.projectCategoryService
        .getByProjectId(+currentProjectId)
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

      this.projectStatusService
        .getByProjectId(+currentProjectId)
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

      this.projectsApiService
        .getProjectUsers(+currentProjectId)
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
    this.tasksService
      .getOne(taskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          const data = response.data;
          let priorityId = data.priority?.id ?? null;
          if (!data.priority) {
            const mediumPriority = this.prioritiesRaw().find((p: any) => p.code === TaskPriorityEnum.MEDIUM);
            if (mediumPriority) {
              priorityId = mediumPriority.id;
            }
          }
          this.taskForm.patchValue({
            description: data.description,
            additionalDescription: data.additionalDescription || '',
            priceEstimation: data.priceEstimation || 0,
            workedTime: data.workedTime || 0,
            accessRole: data.accessRole?.id || null,
            priorityId,
            statusId: data.status?.id || null,
            categoryIds: data.categories?.map((c: any) => c.id) || [],
            assignedUserIds: data.assignedUsers?.map((u: any) => u.id) || [],
          });

          const assignedUsers = data.assignedUsers || [];
          const currentProjectUsers = this.projectUsers();
          const missingUsers = assignedUsers.filter(
            (u: any) => !currentProjectUsers.some((pu: any) => pu.id === u.id),
          ).map((u: any) => ({
            id: u.id,
            name: u.email || u.name || String(u.id),
            ...u,
          }));
          if (missingUsers.length > 0) {
            this.projectUsers.set([...currentProjectUsers, ...missingUsers]);
          }

          if (data.attachments && data.attachments.length > 0) {
            this.existingAttachments.set(data.attachments);
          }

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
    const formData = new FormData();

    Object.keys(taskData).forEach(key => {
      const value = (taskData as any)[key];
      if (value !== undefined) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            const jsonValue = JSON.stringify(value);
            formData.append(key, jsonValue);
          }
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    this.attachments().forEach(attachment => {
      formData.append('attachments', attachment.file);
    });

    const entries: string[] = [];
    formData.forEach((value, key) => {
      entries.push(`${key}: ${value}`);
    });

    this.tasksService
      .addWithFiles(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.notificationService.showNotification(
            this.translateService.instant('Task.addSuccess'),
            NotificationTypeEnum.Success,
          );

          const newTaskId = response?.data?.id;
          const currentProjectId = this.projectId();

          if (newTaskId && currentProjectId) {
            this.router
              .navigate(['/projects', currentProjectId, 'tasks', 'details', newTaskId])
              .then();
          } else if (currentProjectId) {
            this.router
              .navigate(['/projects', currentProjectId, 'tasks'])
              .then();
          }
        },
        error: error => {
          this.handleSubmissionError(error);
        },
        complete: () => {
          this.submitting.set(false);
        },
      });
  }

  private updateTask(taskId: number, taskData: AddTaskDto): void {
    const { projectId, ...updateData } = taskData;

    const formData = new FormData();

    Object.keys(updateData).forEach(key => {
      const value = (updateData as any)[key];
      if (value !== undefined) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            formData.append(key, JSON.stringify(value));
          }
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    this.attachments().forEach(attachment => {
      formData.append('attachments', attachment.file);
    });

    const attachmentsToDelete = this.attachmentsToDelete();
    if (attachmentsToDelete.length > 0) {
      formData.append(
        'attachmentsToDelete',
        JSON.stringify(attachmentsToDelete),
      );
    }

    this.tasksService
      .updateWithFiles(taskId, formData)
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
            this.router
              .navigate([
                '/projects',
                projectIdToUse,
                'tasks',
                'details',
                taskIdToUse,
              ])
              .then();
          } else {
            this.router.navigate(['/projects']).then();
          }
        },
        error: error => {
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
      Object.keys(this.fieldErrors).forEach(
        key => delete this.fieldErrors[key],
      );
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

    this.priorities.set(
      (this.prioritiesRaw() || []).map((item: any) => ({
        id: item.id,
        name: item.translations?.find((t: any) => t.lang === lang)?.name
          || item.translations?.[0]?.name
          || item.name
          || '',
      })),
    );

    this.categories.set(
      (this.categoriesRaw() || []).map((item: any) => ({
        id: item.id,
        name: item.translations?.find((t: any) => t.lang === lang)?.name
          || item.translations?.[0]?.name
          || item.name
          || '',
      })),
    );

    this.statuses.set(
      (this.statusesRaw() || []).map((item: any) => ({
        id: item.id,
        name: item.translations?.find((t: any) => t.lang === lang)?.name
          || item.translations?.[0]?.name
          || item.name
          || '',
      })),
    );

    this.accessRoles.set(
      (this.accessRolesRaw() || []).map((item: any) => ({
        id: item.id,
        name: item.translations?.find((t: any) => t.lang === lang)?.name
          || item.translations?.[0]?.name
          || item.name
          || '',
      })),
    );
  }
}
