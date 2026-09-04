import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroDocument, heroTrash } from '@ng-icons/heroicons/outline';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subject, catchError, forkJoin, of, takeUntil } from 'rxjs';
import { ProjectCategoryService } from '../project/data-access/project-category.service';
import { ProjectRoleService } from '../project/data-access/project-role.service';
import { ProjectStatusService } from '../project/data-access/project-status.service';
import { ProjectsApiService } from '../project/data-access/project.api.service';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { EditableMultiSelectComponent } from '../shared/components/molecules/editable-multi-select.component';
import { FileUploadComponent, FileUploadItem } from '../shared/components/molecules/file-upload.component';
import { InputFieldComponent } from '../shared/components/molecules/input-field.component';
import { SelectFieldComponent } from '../shared/components/molecules/select-field.component';
import { ImageComponent } from '../shared/components/organisms/image.component';
import { SpinnerComponent } from '../shared/components/atoms/spinner.component';
import { ToastTypeEnum } from '../shared/enums/toast-type.enum';
import { TASK_PRIORITY_LABELS, TaskPriorityEnum } from '../shared/enums/task-priority.enum';
import { NotificationService } from '../shared/services/notification.service';
import { TasksService } from './data-access/task.service';
import { CreateTaskPayload, UpdateTaskPayload } from './defs/task.defs';
import { TextareaFieldComponent } from '../shared/components/molecules/textarea-field.component';
import { SimpleNameItem } from '../shared/defs/common.defs';
import { errorKeyOf, fieldErrorsOf } from '../shared/utils/api-error.utils';
import { FileApiService } from '../file/data-access/file.api.service';
import { StoredFile } from '../file/defs/file.defs';
import { formatFileSize as formatFileSizeUtil } from '../shared/utils/file-size.utils';

@Component({
  selector: 'app-task-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ButtonComponent,
    TitleComponent,
    EditableMultiSelectComponent,
    InputFieldComponent,
    SelectFieldComponent,
    FileUploadComponent,
    ImageComponent,
    ErrorMessageComponent,
    NgIcon,
    TextareaFieldComponent,
    SpinnerComponent,
  ],
  providers: [
    provideIcons({
      heroTrash,
      heroDocument,
      heroArrowLeft,
    }),
  ],
  template: `
    <div class="max-w-4xl mx-auto">
      <app-title
        [text]="
          taskId()
            ? ('Task.editTask' | translate)
            : projectId()
              ? ('Task.addTaskToProject' | translate)
              : ('Task.addTask' | translate)
        "
      ></app-title>
      @if (loading()) {
        <div class="flex justify-center items-center min-h-32">
          <app-spinner />
        </div>
      } @else {
        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="space-y-6 mt-6">
          <div>
            <app-input-field
              id="name"
              [control]="nameControl"
              [label]="'Task.name' | translate"
              [placeholder]="'Task.namePlaceholder' | translate"
              [errorMessage]="'FormValidationMessage.required' | translate"
            />
          </div>

          <div>
            <app-textarea-field
              id="description"
              [control]="descriptionControl"
              [label]="'Task.description' | translate"
              [placeholder]="'Task.descriptionPlaceholder' | translate"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <app-input-field
                [control]="priceEstimationControl"
                id="priceEstimation"
                [label]="'Task.priceEstimation' | translate"
                type="number"
              />
              @if (fieldErrors['priceEstimation']) {
                <app-error-message [customMessage]="fieldErrors['priceEstimation'].join(', ')" />
              }
            </div>

            <app-select-field
              [control]="priorityIdControl"
              id="priorityId"
              [label]="'Task.priority' | translate"
              [options]="priorityOptions"
            />
            @if (fieldErrors['priorityId']) {
              <app-error-message [customMessage]="fieldErrors['priorityId'].join(', ')" />
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
                <app-error-message [customMessage]="fieldErrors['categoryIds'].join(', ')" />
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
                  <app-error-message [customMessage]="fieldErrors['assignedUserIds'].join(', ')" />
                }
              } @else {
                <p class="text-sm text-text-muted dark:text-dark-text-muted italic">
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
                <app-error-message [customMessage]="fieldErrors['statusId'].join(', ')" />
              }
            }

            <app-select-field
              [control]="accessRoleControl"
              id="accessRole"
              [label]="'Task.accessRole' | translate"
              [options]="accessRoleOptions"
            />
            @if (fieldErrors['accessRole']) {
              <app-error-message [customMessage]="fieldErrors['accessRole'].join(', ')" />
            }
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-medium text-text-primary dark:text-dark-text-primary">
              {{ 'Task.attachments' | translate }}
            </h3>

            @if (existingAttachments().length > 0) {
              <div class="space-y-2">
                <h4 class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                  {{ 'Task.existingAttachments' | translate }}
                </h4>
                <div class="flex flex-col gap-3">
                  @for (attachment of existingAttachments(); track attachment.id) {
                    <div
                      class="flex items-center justify-between p-3 bg-background-secondary dark:bg-dark-background-secondary dark:text-dark-text-primary rounded-lg border border-border-primary dark:border-dark-border-primary transition-opacity duration-200"
                    >
                      <div class="flex items-center gap-3 flex-1 min-w-0">
                        <div class="shrink-0">
                          @if (isImage(attachment.originalName)) {
                            <app-image
                              [initialUrl]="'/files/' + attachment.id"
                              [mode]="'preview'"
                              [format]="'square'"
                              [size]="'sm'"
                              class="w-10 h-10 object-cover rounded-md cursor-pointer"
                            />
                          } @else {
                            <ng-icon name="heroDocument" size="20" class="text-info-500"></ng-icon>
                          }
                        </div>

                        <div class="min-w-0 flex-1">
                          <p class="text-sm font-medium text-text-primary dark:text-dark-text-primary truncate">
                            {{ attachment.originalName }}
                          </p>
                          <p class="text-xs text-text-secondary dark:text-dark-text-secondary">
                            {{ formatFileSize(attachment.sizeBytes) }}
                          </p>
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          (click)="removeExistingAttachment(attachment)"
                          class="p-1 rounded-md outline-none border-none text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-200"
                          [title]="'Basic.delete' | translate"
                        >
                          <ng-icon name="heroTrash" size="16"></ng-icon>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <div class="space-y-2">
              @if (taskId()) {
                <h4 class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                  {{ 'Task.addNewAttachments' | translate }}
                </h4>
              }
              <div
                [class]="getTotalAttachments() > maxAttachmentsLimit ? 'border-2 border-danger-500 rounded-md p-2' : ''"
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
                  class="text-xs text-text-secondary dark:text-dark-text-secondary"
                  [class]="
                    getTotalAttachments() > maxAttachmentsLimit
                      ? 'text-danger-500'
                      : 'text-text-secondary dark:text-dark-text-secondary'
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
                <p class="text-xs text-danger-500">
                  {{ 'Task.attachmentsLimitExceeded' | translate }}
                </p>
              }
              @if (fieldErrors['attachments']) {
                <app-error-message [customMessage]="fieldErrors['attachments'].join(', ')" />
              }
            </div>
          </div>

          @if (error()) {
            <div class="p-4 bg-danger-50 border border-danger-200 rounded-md">
              <p class="text-danger-600 text-sm">{{ error() }}</p>
            </div>
          }

          <div class="flex justify-between items-center pt-6">
            <app-button type="button" (click)="onCancel()" variant="stroked">
              {{ 'Basic.cancel' | translate }}
            </app-button>

            <app-button
              type="submit"
              [disabled]="!taskForm.valid || submitting() || getTotalAttachments() > maxAttachmentsLimit"
            >
              @if (submitting()) {
                <app-spinner />
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
  private readonly projectCategoryService = inject(ProjectCategoryService);
  private readonly projectRoleService = inject(ProjectRoleService);
  private readonly projectStatusService = inject(ProjectStatusService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fileApiService = inject(FileApiService);

  private readonly destroy$ = new Subject<void>();

  public readonly projectId = signal<string | null>(null);
  public readonly taskId = signal<string | null>(null);
  public readonly loading = signal(true);
  public readonly submitting = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly priorities = signal<SimpleNameItem[]>(
    Object.values(TaskPriorityEnum).map(priority => ({ id: priority, name: TASK_PRIORITY_LABELS[priority] })),
  );
  public readonly categories = signal<SimpleNameItem[]>([]);
  public readonly statuses = signal<SimpleNameItem[]>([]);
  public readonly accessRoles = signal<SimpleNameItem[]>([]);
  public readonly projectUsers = signal<SimpleNameItem[]>([]);
  public readonly attachments = signal<FileUploadItem[]>([]);
  public readonly existingAttachments = signal<StoredFile[]>([]);
  public readonly taskVersion = signal<number | null>(null);

  protected readonly maxAttachmentsLimit = 4;
  protected readonly formatFileSize = formatFileSizeUtil;

  protected taskForm!: FormGroup;
  protected fieldErrors: Record<string, string[]> = {};

  public get nameControl(): FormControl {
    return this.taskForm.get('name') as FormControl;
  }

  public get descriptionControl(): FormControl {
    return this.taskForm.get('description') as FormControl;
  }

  public get priceEstimationControl(): FormControl {
    return this.taskForm.get('priceEstimation') as FormControl;
  }

  public get priorityIdControl(): FormControl {
    return this.taskForm.get('priorityId') as FormControl;
  }

  public get statusIdControl(): FormControl {
    return this.taskForm.get('statusId') as FormControl;
  }

  public get accessRoleControl(): FormControl {
    return this.taskForm.get('accessRole') as FormControl;
  }

  public get priorityOptions(): Array<{ value: string; label: string }> {
    return this.priorities().map(item => ({
      value: item.id,
      label: this.translateService.instant(item.name),
    }));
  }

  public get statusOptions(): Array<{ value: string | null; label: string }> {
    return [
      { value: null, label: this.translateService.instant('Basic.none') },
      ...this.statuses().map(status => ({ value: status.id, label: status.name })),
    ];
  }

  public get accessRoleOptions(): Array<{ value: string | null; label: string }> {
    return [
      { value: null, label: this.translateService.instant('Basic.none') },
      ...this.accessRoles().map(role => ({ value: role.id, label: role.name })),
    ];
  }

  ngOnInit(): void {
    this.initializeForm();
    this.initializeRouteContext();
    this.initializeFormDefaults();
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

  protected removeExistingAttachment(file: StoredFile): void {
    this.existingAttachments.update(files => files.filter(item => item.id !== file.id));

    if (this.getTotalAttachments() <= this.maxAttachmentsLimit) {
      this.error.set(null);
    }
  }

  protected isImage(filename: string): boolean {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
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
      this.error.set(this.translateService.instant('Task.projectRequiredError'));
      this.submitting.set(false);
      return;
    }

    const payload: CreateTaskPayload = {
      name: formValue.name,
      description: formValue.description || null,
      priority: formValue.priority ?? TaskPriorityEnum.MEDIUM,
      priceEstimation: formValue.priceEstimation || 0,
      accessRoleId: formValue.accessRole || null,
      categoryIds: Array.isArray(formValue.categoryIds) ? formValue.categoryIds : [],
      statusId: formValue.statusId || null,
      assigneeIds: Array.isArray(formValue.assignedUserIds) ? formValue.assignedUserIds : [],
      attachmentIds: this.allAttachmentIds(),
    };

    if (currentTaskId) {
      this.updateTask(currentTaskId, payload);
    } else {
      this.createTask(currentProjectId, payload);
    }
  }

  private loadAttachmentMetadata(fileIds: string[]): void {
    if (fileIds.length === 0) {
      this.existingAttachments.set([]);
      return;
    }

    forkJoin(fileIds.map(fileId => this.fileApiService.getFile(fileId).pipe(catchError(() => of(null)))))
      .pipe(takeUntil(this.destroy$))
      .subscribe(files => this.existingAttachments.set(files.filter((file): file is StoredFile => file !== null)));
  }

  private allAttachmentIds(): string[] {
    const uploaded = this.attachments()
      .map(item => item.id)
      .filter((id): id is string => !!id);
    return [...this.existingAttachments().map(file => file.id), ...uploaded];
  }

  protected onCancel(): void {
    const currentProjectId = this.projectId();
    if (currentProjectId) {
      this.router.navigate(['/projects', currentProjectId, 'tasks']).then();
    } else {
      this.router.navigate(['/projects']).then();
    }
  }

  private initializeForm(): void {
    this.taskForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      priceEstimation: [0],
      accessRole: [null],
      priority: [null],
      statusId: [null],
      projectId: [null],
      categoryIds: [[]],
      assignedUserIds: [[]],
    });
  }

  private initializeRouteContext(): void {
    const projectIdParam = this.route.snapshot.paramMap.get('id');
    const taskIdParam = this.route.snapshot.paramMap.get('taskId');
    this.projectId.set(projectIdParam);
    this.taskId.set(taskIdParam);

    if (projectIdParam) {
      this.taskForm.patchValue({ projectId: projectIdParam });
    }
  }

  private initializeFormDefaults(): void {
    this.taskForm.patchValue({
      accessRole: null,
      statusId: null,
      priority: TaskPriorityEnum.MEDIUM,
    });
  }

  private setupLanguageSubscription(): void {
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadOptions();
    });
  }

  private loadOptions(): void {
    const currentProjectId = this.projectId();

    if (this.taskForm.get('priority')?.value == null) {
      this.taskForm.patchValue({ priority: TaskPriorityEnum.MEDIUM });
    }

    this.projectRoleService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: accessRolesRes => {
          this.accessRoles.set(accessRolesRes.map(role => ({ id: role.id, name: role.name })));
        },
        error: error => {
          console.error('Error loading access roles:', error);
          this.error.set(this.translateService.instant('Task.loadError'));
        },
      });

    if (currentProjectId) {
      this.projectCategoryService
        .getByProjectId(currentProjectId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: categoriesRes => {
            this.categories.set(categoriesRes.map(category => ({ id: category.id, name: category.name })));
          },
          error: error => {
            console.error('Error loading categories:', error);
            this.error.set(this.translateService.instant('Task.loadError'));
          },
        });

      this.projectStatusService
        .getByProjectId(currentProjectId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: statusesRes => {
            this.statuses.set(statusesRes.map(status => ({ id: status.id, name: status.name })));
          },
          error: error => {
            console.error('Error loading statuses:', error);
            this.error.set(this.translateService.instant('Task.loadError'));
          },
        });

      this.projectsApiService
        .getProjectMembers(currentProjectId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: usersRes => {
            this.projectUsers.set(
              usersRes.map(member => ({ id: member.userId, name: member.displayName || member.email })),
            );
          },
          error: error => {
            console.error('Error loading project users:', error);
            this.error.set(this.translateService.instant('Task.loadError'));
          },
        });

      const taskIdParam = this.taskId();
      if (taskIdParam) {
        this.loadTaskData(taskIdParam);
      } else {
        this.loading.set(false);
      }
    } else {
      this.loading.set(false);
    }
  }

  private loadTaskData(taskId: string): void {
    this.tasksService
      .getOne(taskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          const details = response;
          const task = details.task;
          this.taskVersion.set(task.version);
          this.taskForm.patchValue({
            name: task.name,
            description: task.description || '',
            priceEstimation: task.priceEstimation || 0,
            accessRole: task.accessRoleId || null,
            priority: task.priority,
            statusId: task.statusId || null,
            categoryIds: task.categoryIds ?? [],
            assignedUserIds: task.assigneeIds ?? [],
          });

          const known = new Set(this.projectUsers().map(user => user.id));
          const missing = details.assignees
            .filter(assignee => !known.has(assignee.id))
            .map(assignee => ({ id: assignee.id, name: assignee.displayName }));
          if (missing.length > 0) {
            this.projectUsers.set([...this.projectUsers(), ...missing]);
          }

          this.loadAttachmentMetadata(task.attachmentIds ?? []);
          this.loading.set(false);
        },
        error: error => {
          console.error('Error loading task data:', error);
          this.error.set(this.translateService.instant('Task.loadError'));
          this.loading.set(false);
        },
      });
  }

  private createTask(projectId: string, payload: CreateTaskPayload): void {
    this.tasksService
      .add(projectId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.notificationService.showNotification(
            this.translateService.instant('Task.addSuccess'),
            ToastTypeEnum.Success,
          );
          this.router.navigate(['/projects', projectId, 'tasks', 'details', response.id]).then();
        },
        error: (error: unknown) => this.handleSubmissionError(error),
        complete: () => this.submitting.set(false),
      });
  }

  private updateTask(taskId: string, payload: UpdateTaskPayload): void {
    this.tasksService
      .update(taskId, payload, this.taskVersion())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.notificationService.showNotification(
            this.translateService.instant('Task.updateSuccess'),
            ToastTypeEnum.Success,
          );
          const task = response;
          this.router.navigate(['/projects', task.projectId, 'tasks', 'details', task.id]).then();
        },
        error: (error: unknown) => this.handleSubmissionError(error),
        complete: () => this.submitting.set(false),
      });
  }

  private handleSubmissionError(error: unknown): void {
    const fieldErrors = fieldErrorsOf(error);
    if (Object.keys(fieldErrors).length > 0) {
      this.fieldErrors = fieldErrors;
      this.error.set(null);
      this.cdr.markForCheck();
    } else {
      const message = this.translateService.instant(errorKeyOf(error) ?? 'Task.unknownError');
      this.error.set(message);
      this.notificationService.showNotification(message, ToastTypeEnum.Error);
    }
    this.submitting.set(false);
  }
}
