import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft,
  heroCalendar,
  heroClock,
  heroDocument,
  heroExclamationTriangle,
  heroFlag,
  heroFolder,
  heroPaperAirplane,
  heroPencil,
  heroTag,
  heroTrash,
  heroUserGroup,
} from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, catchError, forkJoin, map, of, takeUntil } from 'rxjs';
import { AuthStateService } from '../auth/data-access/auth.state.service';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { SpinnerComponent } from '../shared/components/atoms/spinner.component';
import { FileUploadComponent, FileUploadItem } from '../shared/components/molecules/file-upload.component';
import { ProjectsService } from '../project/data-access/project.service';
import { FileApiService } from '../file/data-access/file.api.service';
import { FileUploadService } from '../file/data-access/file-upload.service';
import { FileScopeEnum } from '../file/defs/file.defs';
import { ProjectRolePermissionEnum } from '../shared/enums/project-role-permission.enum';
import { TaskPriorityEnum } from '../shared/enums/task-priority.enum';
import { DropdownComponent, DropdownMenuDirective } from '../shared/components/atoms/dropdown.component';
import { ButtonRoleEnum } from '../shared/enums/modal.enum';
import { ToastTypeEnum } from '../shared/enums/toast-type.enum';
import { CustomDatePipe } from '../shared/pipes/custom-date.pipe';
import { ModalService } from '../shared/services/modal.service';
import { NotificationService } from '../shared/services/notification.service';
import { getContrastColor } from '../shared/utils/color.utils';
import { TasksService } from './data-access/task.service';
import { TaskComment, TaskDetails } from './defs/task.defs';
import { TextareaFieldComponent } from '../shared/components/molecules/textarea-field.component';
import { BackButtonComponent } from '../shared/components/molecules/back-button.component';

@Component({
  selector: 'app-task-details',
  imports: [
    CommonModule,
    TranslateModule,
    NgIcon,
    ReactiveFormsModule,
    FormsModule,
    CustomDatePipe,
    FileUploadComponent,
    ButtonComponent,
    DropdownComponent,
    SpinnerComponent,
    TextareaFieldComponent,
    BackButtonComponent,
    DropdownMenuDirective,
  ],
  providers: [
    provideIcons({
      heroArrowLeft,
      heroCalendar,
      heroDocument,
      heroPaperAirplane,
      heroPencil,
      heroTrash,
      heroClock,
      heroUserGroup,
      heroTag,
      heroFolder,
      heroExclamationTriangle,
      heroFlag,
    }),
  ],
  template: `
    <div class="min-h-screen">
      <div class="container mx-auto max-w-7xl">
        <header class="flex flex-row items-start justify-between gap-4 mb-6">
          <app-back-button (clicked)="goBack()"></app-back-button>

          @if (task()) {
            <app-dropdown [closeSignal]="closeDropdownSignal()">
              <app-button variant="stroked" type="button" dropdownTrigger>
                <span>{{ 'Basic.actions' | translate }}</span>
                <ng-icon name="heroChevronDown" size="16"></ng-icon>
              </app-button>

              <ng-container *appDropdownMenu>
                <button
                  type="button"
                  class="text-left flex items-center gap-2 px-3 py-2 text-sm text-text-primary dark:text-dark-text-primary hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors duration-200"
                  (click)="editTask(); closeDropdown()"
                >
                  <ng-icon name="heroPencil" size="16"></ng-icon>
                  <span>{{ 'Basic.edit' | translate }}</span>
                </button>

                <button
                  type="button"
                  class="text-left flex items-center gap-2 px-3 py-2 text-sm text-danger-500 hover:text-danger-600 dark:text-danger-400 dark:hover:text-danger-300 hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors duration-200"
                  (click)="deleteTask(); closeDropdown()"
                >
                  <ng-icon name="heroTrash" size="16"></ng-icon>
                  <span>{{ 'Basic.delete' | translate }}</span>
                </button>
              </ng-container>
            </app-dropdown>
          }
        </header>

        @if (loading()) {
          <div class="flex justify-center items-center py-20">
            <app-spinner />
          </div>
        } @else if (task()) {
          <main class="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 animate-fade-in">
            <div class="lg:col-span-2 space-y-6">
              <div class="rounded-lg shadow-soft p-6 dark:border-dark-border-primary border-border-primary border">
                <h1
                  class="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4 border-b border-border-primary dark:border-dark-border-primary pb-4 wrap-break-word"
                >
                  {{ task()!.task.description }}
                </h1>

                @if (task()!.task.additionalDescription) {
                  <div>
                    <h2 class="text-lg font-semibold text-text-secondary dark:text-dark-text-secondary mb-2">
                      {{ 'Task.additionalDescription' | translate }}
                    </h2>
                    <p
                      class="text-text-primary dark:text-dark-text-primary leading-relaxed wrap-break-word whitespace-pre-wrap"
                    >
                      {{ task()!.task.additionalDescription }}
                    </p>
                  </div>
                }
              </div>

              @if (taskAttachments().length > 0) {
                <div class="dark:border-dark-border-primary border-border-primary border rounded-lg shadow-soft p-6">
                  <h3 class="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
                    {{ 'Task.attachments' | translate }}
                  </h3>
                  <div class="flex flex-wrap justify-center items-center -m-2">
                    @for (attachment of taskAttachments(); track attachment.id) {
                      <div class="w-1/2 md:w-1/4 p-2 flex justify-center">
                        <div
                          class="group relative overflow-hidden rounded-lg border border-border-primary dark:border-dark-border-primary transition-shadow duration-200 hover:shadow-md"
                        >
                          <button
                            type="button"
                            (click)="downloadAttachment(attachment.id)"
                            class="flex flex-col items-center justify-center gap-2 p-3 bg-neutral-100 dark:bg-neutral-800 h-32 w-full text-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
                          >
                            <ng-icon name="heroDocument" size="32" class="text-primary-500"></ng-icon>
                            <span class="text-xs text-text-secondary dark:text-dark-text-secondary break-all">{{
                              attachment.name
                            }}</span>
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <div class="rounded-lg shadow-soft p-6 dark:border-dark-border-primary border-border-primary border">
                <h2 class="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
                  {{ 'Task.comments' | translate }}
                  @if (task()!.comments && task()!.comments.length > 0) {
                    <span
                      class="ml-2 text-sm font-medium bg-neutral-200 dark:bg-neutral-600 text-text-secondary dark:text-dark-text-secondary rounded-full px-2 py-0.5"
                      >{{ task()!.comments.length }}</span
                    >
                  }
                </h2>

                <form [formGroup]="commentForm" (ngSubmit)="onSubmitComment()" class="mb-8">
                  <div class="mb-3">
                    <app-textarea-field
                      id="commentContent"
                      [control]="contentControl"
                      [placeholder]="'Task.commentPlaceholder' | translate"
                      [rows]="4"
                      [errorMessage]="'FormValidationMessage.required' | translate"
                    ></app-textarea-field>
                  </div>
                  <div class="mb-4">
                    <app-file-upload
                      [multiple]="true"
                      [maxFiles]="maxAttachmentsLimit"
                      [maxSizeBytes]="5242880"
                      accept="image/jpeg,image/png,image/gif,application/pdf,text/plain"
                      (filesChange)="onCommentFilesChange($event)"
                    />
                  </div>
                  <div class="flex justify-end">
                    <app-button type="submit" [disabled]="commentForm.invalid || submittingComment()">
                      <ng-icon name="heroPaperAirplane" size="16"></ng-icon>
                      <span>
                        @if (submittingComment()) {
                          {{ 'Basic.submitting' | translate }}
                        } @else {
                          {{ 'Task.addComment' | translate }}
                        }
                      </span>
                    </app-button>
                  </div>
                </form>

                @if (task()!.comments && task()!.comments.length > 0) {
                  <div class="space-y-6">
                    @for (comment of task()!.comments; track comment.id) {
                      <div class="flex gap-4">
                        <div class="flex-1 min-w-0">
                          @if (editingCommentId === comment.id) {
                            <div class="space-y-2">
                              @if (editingCommentControl) {
                                <div class="mb-3">
                                  <app-textarea-field
                                    id="editingCommentContent"
                                    [control]="editingCommentControl"
                                    [placeholder]="'Task.commentPlaceholder' | translate"
                                    [rows]="3"
                                    [errorMessage]="'FormValidationMessage.required' | translate"
                                  ></app-textarea-field>
                                </div>
                              }
                              <div class="mb-4">
                                <app-file-upload
                                  [multiple]="true"
                                  [maxFiles]="maxAttachmentsLimit"
                                  [maxSizeBytes]="5242880"
                                  accept="image/jpeg,image/png,image/gif,application/pdf,text/plain"
                                  (filesChange)="onEditCommentFilesChange($event)"
                                />
                              </div>
                              <div class="flex flex-wrap gap-2 mb-2">
                                @for (att of editingCommentExistingAttachments; track att) {
                                  <div
                                    class="relative flex items-center border border-border-primary dark:border-dark-border-primary rounded-lg px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 shadow-sm transition-all duration-200 w-full mb-2"
                                  >
                                    <ng-icon
                                      name="heroDocument"
                                      size="18"
                                      class="text-primary-500 mr-2 shrink-0"
                                    ></ng-icon>
                                    <span
                                      class="text-xs font-medium text-text-primary dark:text-dark-text-primary break-all flex-1 truncate"
                                      >{{ attachmentName(att) }}</span
                                    >
                                    <button
                                      type="button"
                                      (click)="detachFromComment(att)"
                                      class="ml-2 p-1 rounded-md outline-none border-none shrink-0 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                                      [title]="'Basic.delete' | translate"
                                    >
                                      <ng-icon name="heroTrash" size="16" class="align-middle"></ng-icon>
                                    </button>
                                  </div>
                                }
                              </div>
                              <div class="flex gap-2">
                                <app-button type="button" (clicked)="onCancelEditComment()" variant="stroked">
                                  {{ 'Basic.cancel' | translate }}
                                </app-button>
                                <app-button type="button" (clicked)="onSaveEditComment()">
                                  {{ 'Task.saveComment' | translate }}
                                </app-button>
                              </div>
                            </div>
                          } @else {
                            <div class="group">
                              <div class="flex justify-between items-center">
                                <span class="font-semibold text-text-primary dark:text-dark-text-primary">
                                  {{ comment.author.displayName }}
                                </span>
                                <div class="flex items-center gap-1">
                                  @if (canDeleteComment(comment)) {
                                    <button
                                      type="button"
                                      (click)="onEditComment(comment.id, comment.content)"
                                      class="text-info-600 hover:text-info-800 p-1 rounded-full hover:bg-info-100 dark:hover:bg-info-900/50"
                                      [title]="'Task.editComment' | translate"
                                    >
                                      <ng-icon name="heroPencil" size="16"></ng-icon>
                                    </button>
                                    <button
                                      type="button"
                                      (click)="onDeleteComment(comment.id)"
                                      class="text-danger-600 hover:text-danger-800 p-1 rounded-full hover:bg-danger-100 dark:hover:bg-danger-900/50"
                                      [title]="'Task.deleteComment' | translate"
                                    >
                                      <ng-icon name="heroTrash" size="16"></ng-icon>
                                    </button>
                                  }
                                </div>
                              </div>
                              <div class="flex flex-wrap flex-col">
                                <div>
                                  <span class="text-xs text-text-muted dark:text-dark-text-muted">
                                    {{ 'Task.dateCreation' | translate }}:
                                    {{ comment.createdAt | customDate: 'dd.MM.yyyy HH:mm' }}
                                  </span>
                                </div>
                                <div>
                                  <span class="text-xs text-text-muted dark:text-dark-text-muted">
                                    {{ 'Task.dateModification' | translate }}:
                                    {{ (comment.updatedAt | customDate: 'dd.MM.yyyy HH:mm') || '-' }}
                                  </span>
                                </div>
                              </div>
                              <p class="text-text-primary dark:text-dark-text-primary wrap-break-word">
                                {{ comment.content }}
                              </p>

                              @if (comment.attachmentIds.length > 0) {
                                <div class="flex flex-wrap justify-start -m-1 mt-2">
                                  @for (attachment of comment.attachmentIds; track attachment) {
                                    <div class="w-1/2 sm:w-1/3 md:w-1/4 p-1">
                                      <button
                                        type="button"
                                        (click)="downloadAttachment(attachment)"
                                        class="flex items-center gap-2 p-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-md h-20 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
                                      >
                                        <ng-icon name="heroDocument" size="20" class="text-blue-500 shrink-0"></ng-icon>
                                        <span class="text-xs text-text-primary dark:text-dark-text-primary truncate">{{
                                          attachmentName(attachment)
                                        }}</span>
                                      </button>
                                    </div>
                                  }
                                </div>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div
                    class="text-center py-8 text-text-muted dark:text-dark-text-muted border-2 border-dashed border-border-primary dark:border-dark-border-primary rounded-lg"
                  >
                    {{ 'Task.noComments' | translate }}
                  </div>
                }
              </div>
            </div>

            <aside class="lg:col-span-1 space-y-6 mt-6 lg:mt-0">
              <div
                class="rounded-lg shadow-soft p-6 space-y-6 dark:border-dark-border-primary border-border-primary border"
              >
                @if (task()?.statusName) {
                  <div class="flex items-start gap-4">
                    <ng-icon
                      name="heroExclamationTriangle"
                      size="20"
                      class="shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
                    ></ng-icon>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                        {{ 'Task.status' | translate }}
                      </h4>
                      <div class="flex items-center gap-2 mt-1">
                        <div
                          class="w-3 h-3 rounded-full"
                          [style.background-color]="task()?.task?.statusId ? statusColor() : null"
                        ></div>
                        <p class="text-md font-semibold text-text-primary dark:text-dark-text-primary">
                          {{ task()?.statusName }}
                        </p>
                      </div>
                    </div>
                  </div>
                }

                @if (task()!.task.priority) {
                  <div class="flex items-start gap-4">
                    <ng-icon
                      name="heroFlag"
                      size="20"
                      class="shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
                    ></ng-icon>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                        {{ 'Task.priority' | translate }}
                      </h4>
                      <div class="flex items-center gap-2 mt-1">
                        <div class="w-3 h-3 rounded-full" [style.background-color]="priorityColor()"></div>
                        <p class="text-md font-semibold text-text-primary dark:text-dark-text-primary">
                          {{ 'Task.priority' + task()!.task.priority | translate }}
                        </p>
                      </div>
                    </div>
                  </div>
                }

                @if (projectName()) {
                  <div class="flex items-start gap-4">
                    <ng-icon
                      name="heroFolder"
                      size="20"
                      class="shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
                    ></ng-icon>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                        {{ 'Task.project' | translate }}
                      </h4>
                      <p
                        class="text-md font-semibold text-text-primary dark:text-dark-text-primary mt-1 wrap-break-word"
                      >
                        {{ projectName() }}
                      </p>
                    </div>
                  </div>
                }

                <div class="flex items-start gap-4">
                  <ng-icon
                    name="heroClock"
                    size="20"
                    class="shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
                  ></ng-icon>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                      {{ 'Task.timeTracking' | translate }}
                    </h4>
                    <div class="text-md font-semibold text-text-primary dark:text-dark-text-primary mt-1">
                      <span [title]="'Task.workedTime' | translate">{{ formatHours(task()!.task.workedTime) }}</span>
                      <span class="mx-1 text-text-muted dark:text-dark-text-muted font-normal">/</span>
                      <span [title]="'Task.priceEstimation' | translate">{{
                        formatHours(task()!.task.priceEstimation)
                      }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <ng-icon
                    name="heroCalendar"
                    size="20"
                    class="shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
                  ></ng-icon>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                      {{ 'Task.dates' | translate }}
                    </h4>
                    <div class="text-sm text-text-primary dark:text-dark-text-primary mt-1 space-y-1">
                      <p>
                        <span class="font-semibold">{{ 'Task.created' | translate }}:</span>
                        {{ task()!.task.createdAt | customDate: 'dd.MM.yyyy' }}
                      </p>
                      <p>
                        <span class="font-semibold">{{ 'Task.modified' | translate }}:</span>
                        {{ (task()!.task.updatedAt | customDate: 'dd.MM.yyyy') || '-' }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <ng-icon
                    name="heroUserGroup"
                    size="20"
                    class="shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
                  ></ng-icon>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                      {{ 'Task.people' | translate }}
                    </h4>
                    <div class="mt-2 space-y-2 text-sm">
                      <p class="font-semibold text-text-primary dark:text-dark-text-primary wrap-break-word">
                        {{ 'Task.createdBy' | translate }}:
                        <span class="font-normal">{{ createdByName() }}</span>
                      </p>

                      <h5 class="font-semibold text-text-primary dark:text-dark-text-primary pt-1">
                        {{ 'Task.assignedUsers' | translate }}:
                      </h5>
                      @if (task()!.assignees.length > 0) {
                        <div class="flex flex-wrap gap-2">
                          @for (user of task()!.assignees; track user.id) {
                            <span
                              class="bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 px-2 py-1 rounded-full text-xs font-medium"
                              >{{ user.displayName }}</span
                            >
                          }
                        </div>
                      } @else {
                        <p class="text-xs text-text-muted dark:text-dark-text-muted italic">
                          {{ 'Task.noAssignedUsers' | translate }}
                        </p>
                      }
                    </div>
                  </div>
                </div>

                @if (task()?.categories && task()!.categories.length > 0) {
                  <div class="flex items-start gap-4">
                    <ng-icon
                      name="heroTag"
                      size="20"
                      class="shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
                    ></ng-icon>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                        {{ 'Task.categories' | translate }}
                      </h4>
                      <div class="flex flex-wrap gap-2 mt-2">
                        @for (category of task()!.categories; track category.id) {
                          <div
                            class="flex items-center gap-2 rounded-full px-3 py-1.5"
                            [style.background-color]="category.color"
                          >
                            <span class="text-xs font-semibold" [style.color]="getContrastColor(category.color)">{{
                              getTranslatedName(category)
                            }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </aside>
          </main>
        } @else {
          <div
            class="text-center py-20 rounded-lg shadow-soft dark:border-dark-border-primary border-border-primary border"
          >
            <h2 class="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
              {{ 'Task.notFound' | translate }}
            </h2>
            <p class="text-text-muted dark:text-dark-text-muted mt-2">
              {{ 'Task.notFoundMessage' | translate }}
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class TaskDetailsPageComponent implements OnInit, OnDestroy {
  public readonly taskId = input.required<string>();

  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly tasksService = inject(TasksService);
  protected readonly translateService = inject(TranslateService);
  protected readonly notificationService = inject(NotificationService);
  protected readonly modalService = inject(ModalService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authStateService = inject(AuthStateService);

  private readonly fileUploadService = inject(FileUploadService);
  private readonly fileApiService = inject(FileApiService);
  private readonly projectsService = inject(ProjectsService);

  protected readonly task = signal<TaskDetails | null>(null);

  private readonly fileNames = signal<Record<string, string>>({});

  protected readonly taskAttachments = computed(() => {
    const names = this.fileNames();
    return (this.task()?.task.attachmentIds ?? []).map(id => ({ id, name: names[id] ?? id }));
  });
  protected readonly loading = signal(true);
  protected readonly submittingComment = signal(false);
  protected readonly commentAttachments = signal<FileUploadItem[]>([]);

  protected readonly closeDropdownSignal = signal(0);

  protected readonly maxAttachmentsLimit = 4;

  protected editingCommentId: string | null = null;
  protected editingCommentVersion: number | null = null;
  protected editingCommentContent: string = '';
  protected editingCommentAttachments: FileUploadItem[] = [];
  protected editingCommentExistingAttachments: string[] = [];
  protected editingCommentControl: FormControl | null = null;

  private readonly destroy$ = new Subject<void>();

  protected commentForm: FormGroup = this.formBuilder.group({
    content: ['', [Validators.required, Validators.minLength(1)]],
  });

  private currentLang: string = this.translateService.getCurrentLang() || 'pl';

  public get contentControl(): FormControl {
    return this.commentForm.get('content') as FormControl;
  }

  ngOnInit(): void {
    this.loadTask();
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(({ lang }) => {
      this.currentLang = lang;
      this.task.set(this.task());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected closeDropdown(): void {
    this.closeDropdownSignal.set(Date.now());
  }

  protected goBack(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.router.navigate(['/projects', projectId, 'tasks']).then();
    } else {
      this.router.navigate(['/projects']).then();
    }
  }

  protected formatHours(value: number): string {
    if (value === 0) return '0h';
    const hours = Math.floor(value / 100);
    const minutes = Math.floor((value % 100) * 0.6);

    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  }

  protected editTask(): void {
    const task = this.task();
    const projectId = task?.task.projectId ?? this.route.snapshot.paramMap.get('id');
    if (task && projectId) {
      this.router.navigate(['/projects', projectId, 'tasks', 'edit', task.task.id]).then();
    }
  }

  protected deleteTask(): void {
    this.modalService.present({
      title: this.translateService.instant('Basic.deleteTitle'),
      message: this.translateService.instant('Task.confirmDelete'),
      buttons: [
        {
          role: ButtonRoleEnum.Cancel,
          text: this.translateService.instant('Basic.cancel'),
        },
        {
          role: ButtonRoleEnum.Ok,
          text: this.translateService.instant('Basic.delete'),
          handler: () => this.confirmDelete(),
        },
      ],
    });
  }

  protected onSubmitComment(): void {
    if (this.commentForm.invalid || this.submittingComment()) {
      return;
    }

    this.submittingComment.set(true);
    const content = this.commentForm.get('content')?.value;

    this.tasksService
      .createComment(this.taskId(), { content, attachmentIds: this.commentAttachmentIds })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showNotification(
            this.translateService.instant('Task.commentAdded'),
            ToastTypeEnum.Success,
          );
          this.commentForm.reset();
          this.commentAttachments.set([]);
          this.loadTask();
        },
        error: (error: unknown) => {
          console.error('Error adding comment:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Task.commentError'),
            ToastTypeEnum.Error,
          );
          this.submittingComment.set(false);
        },
        complete: () => {
          this.submittingComment.set(false);
        },
      });
  }

  protected onCommentFilesChange(files: FileUploadItem[]): void {
    this.commentAttachments.set(files);
    this.uploadPendingAttachments(files);
  }

  private uploadPendingAttachments(files: FileUploadItem[]): void {
    for (const item of files.filter(file => !file.id)) {
      this.fileUploadService
        .upload(item.file, FileScopeEnum.TASK_ATTACHMENT, this.taskId())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: stored => (item.id = stored.id),
          error: error => {
            console.error('Attachment upload failed:', error);
            this.notificationService.showNotification(
              this.translateService.instant('Task.attachmentUploadError'),
              ToastTypeEnum.Error,
            );
          },
        });
    }
  }

  private get commentAttachmentIds(): string[] {
    return this.commentAttachments()
      .map(item => item.id)
      .filter((id): id is string => !!id);
  }

  protected isImage(filename: string): boolean {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  protected onEditComment(commentId: string, content: string): void {
    this.editingCommentControl = new FormControl(content, [Validators.required, Validators.minLength(1)]);
    this.editingCommentId = commentId;
    this.editingCommentContent = content;
    const comment = this.task()?.comments.find(item => item.id === commentId);
    this.editingCommentVersion = comment?.version ?? null;
    this.editingCommentExistingAttachments = comment ? [...comment.attachmentIds] : [];
    this.editingCommentAttachments = [];
  }

  protected onCancelEditComment(): void {
    this.editingCommentId = null;
    this.editingCommentVersion = null;
    this.editingCommentControl = null;
    this.editingCommentContent = '';
    this.editingCommentAttachments = [];
    this.editingCommentExistingAttachments = [];
  }

  protected onSaveEditComment(): void {
    if (!this.editingCommentId || !this.editingCommentControl || this.editingCommentControl.invalid) {
      return;
    }

    const content = this.editingCommentControl.value;
    const formData = new FormData();
    formData.append('content', content);
    this.editingCommentAttachments.forEach(file => {
      formData.append('attachments', file.file);
    });

    this.tasksService
      .updateComment(this.editingCommentId, this.editingCommentControl.value ?? '', this.editingCommentVersion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showNotification(
            this.translateService.instant('Task.commentUpdated'),
            ToastTypeEnum.Success,
          );
          this.onCancelEditComment();
          this.loadTask();
        },
        error: (error: unknown) => {
          console.error('Error updating comment:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Task.commentUpdateError'),
            ToastTypeEnum.Error,
          );
        },
        complete: () => {},
      });
  }

  protected onEditCommentFilesChange(files: FileUploadItem[]): void {
    this.editingCommentAttachments = files;
  }

  protected markAttachmentForDelete(attachment: any): void {
    attachment._markedForDelete = !attachment._markedForDelete;
  }

  protected canDeleteComment(comment: TaskComment): boolean {
    const userId = this.authStateService.userId();
    if (userId && comment.author.id === userId) {
      return true;
    }
    return (this.task()?.permissions ?? []).includes(ProjectRolePermissionEnum.MANAGE_TASKS);
  }

  protected onDeleteComment(commentId: string): void {
    this.modalService.present({
      title: this.translateService.instant('Basic.deleteTitle'),
      message: this.translateService.instant('Task.deleteCommentConfirm'),
      buttons: [
        {
          role: ButtonRoleEnum.Cancel,
          text: this.translateService.instant('Basic.cancel'),
        },
        {
          role: ButtonRoleEnum.Ok,
          text: this.translateService.instant('Basic.delete'),
          handler: () => {
            this.tasksService
              .deleteComment(commentId)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.notificationService.showNotification(
                    this.translateService.instant('Task.commentDeleted'),
                    ToastTypeEnum.Success,
                  );
                  this.loadTask();
                  return true;
                },
                error: error => {
                  console.error('Error deleting comment:', error);
                  this.notificationService.showNotification(
                    this.translateService.instant('Task.commentDeleteError'),
                    ToastTypeEnum.Error,
                  );
                  return false;
                },
                complete: () => {},
              });
          },
        },
      ],
    });
  }

  protected getTranslatedName(obj: any): string {
    if (!obj) return '';
    const lang = this.currentLang;
    if (obj.translations && Array.isArray(obj.translations)) {
      let found = obj.translations.find((t: any) => t.lang === lang);
      if (!found && obj.translations[0]?.name) found = obj.translations[0];
      if (found?.name) return found.name;
    }
    return obj.name || '';
  }

  protected readonly projectName = signal<string>('');

  protected readonly createdByName = computed(() => {
    const details = this.task();
    if (!details) {
      return '';
    }
    const author = details.assignees.find(user => user.id === details.task.createdBy);
    return author?.displayName ?? details.task.createdBy;
  });

  protected attachmentName(fileId: string): string {
    return this.fileNames()[fileId] ?? fileId;
  }

  protected downloadAttachment(fileId: string): void {
    this.fileApiService
      .requestDownload(fileId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => window.open(response.data.downloadUrl, '_blank'),
        error: error => {
          console.error('Download failed:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Task.downloadError'),
            ToastTypeEnum.Error,
          );
        },
      });
  }

  protected detachFromComment(fileId: string): void {
    this.editingCommentExistingAttachments = this.editingCommentExistingAttachments.filter(id => id !== fileId);
  }

  protected statusColor(): string | null {
    return null;
  }

  protected priorityColor(): string {
    switch (this.task()?.task.priority) {
      case TaskPriorityEnum.HIGH:
        return '#ef4444';
      case TaskPriorityEnum.LOW:
        return '#22c55e';
      default:
        return '#eab308';
    }
  }

  protected getContrastColor(backgroundColor: string): string {
    return getContrastColor(backgroundColor);
  }

  private loadProjectName(projectId: string): void {
    this.projectsService
      .getProjectById(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => this.projectName.set(response.data.name),
        error: () => this.projectName.set(''),
      });
  }

  private loadFileNames(details: TaskDetails): void {
    const ids = new Set<string>([
      ...details.task.attachmentIds,
      ...details.comments.flatMap(comment => comment.attachmentIds),
    ]);
    const unknown = [...ids].filter(id => !this.fileNames()[id]);
    if (unknown.length === 0) {
      return;
    }

    forkJoin(
      unknown.map(id =>
        this.fileApiService.getFile(id).pipe(
          map(response => [id, response.data.originalName] as const),
          catchError(() => of(null)),
        ),
      ),
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(entries => {
        const resolved = Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => !!entry));
        this.fileNames.update(current => ({ ...current, ...resolved }));
      });
  }

  private loadTask(): void {
    this.loading.set(true);
    this.tasksService
      .getOne(this.taskId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.task.set(response.data);
          this.loadFileNames(response.data);
          this.loadProjectName(response.data.task.projectId);
          this.loading.set(false);
        },
        error: error => {
          console.error('Error loading task:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Task.loadError'),
            ToastTypeEnum.Error,
          );
          this.loading.set(false);
        },
        complete: () => {},
      });
  }

  private confirmDelete(): void {
    this.tasksService
      .delete(this.taskId(), this.task()?.task.version ?? null)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showNotification(
            this.translateService.instant('Task.deleteSuccess'),
            ToastTypeEnum.Success,
          );
          const projectId = this.route.snapshot.paramMap.get('id');
          if (projectId) {
            this.router.navigate(['/projects', projectId, 'tasks']).then();
          } else {
            this.router.navigate(['/projects']).then();
          }
        },
        error: (error: unknown) => {
          console.error('Error deleting task:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Task.deleteError'),
            ToastTypeEnum.Error,
          );
        },
        complete: () => {},
      });
  }
}
