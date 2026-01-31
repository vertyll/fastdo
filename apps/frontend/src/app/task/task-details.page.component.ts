import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, input, signal } from '@angular/core';
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
import { jwtDecode } from 'jwt-decode';
import { Subject, takeUntil } from 'rxjs';
import { AuthStateService } from '../auth/data-access/auth.state.service';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { TextareaComponent } from '../shared/components/atoms/textarea.component';
import { FileUploadComponent, FileUploadItem } from '../shared/components/molecules/file-upload.component';
import { ImageComponent } from '../shared/components/organisms/image.component';
import { ButtonRoleEnum } from '../shared/enums/modal.enum';
import { NotificationTypeEnum } from '../shared/enums/notification.enum';
import { CustomDatePipe } from '../shared/pipes/custom-date.pipe';
import { ModalService } from '../shared/services/modal.service';
import { NotificationService } from '../shared/services/notification.service';
import { getContrastColor } from '../shared/utils/color.utils';
import { TasksService } from './data-access/task.service';
import { Task, TaskComment } from './models/Task';

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
    ImageComponent,
    ErrorMessageComponent,
    ButtonComponent,
    TextareaComponent,
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
      <div class="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <button
            (click)="goBack()"
            class="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
          >
            <ng-icon name="heroArrowLeft" size="20"></ng-icon>
            <span>{{ 'Basic.back' | translate }}</span>
          </button>

          @if (task()) {
            <div class="flex items-center gap-2">
              <button
                (click)="editTask()"
                class="flex items-center gap-2 px-4 py-2 bg-primary-500 dark:bg-primary-600 text-white rounded-md hover:bg-primary-600 dark:hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 transition-colors duration-200 shadow-sm"
              >
                <ng-icon name="heroPencil" size="16"></ng-icon>
                <span>{{ 'Basic.edit' | translate }}</span>
              </button>
              <button
                (click)="deleteTask()"
                class="flex items-center gap-2 px-4 py-2 bg-danger-500 dark:bg-danger-600 text-white rounded-md hover:bg-danger-600 dark:hover:bg-danger-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger-500 transition-colors duration-200 shadow-sm"
              >
                <ng-icon name="heroTrash" size="16"></ng-icon>
                <span>{{ 'Basic.delete' | translate }}</span>
              </button>
            </div>
          }
        </header>

        @if (loading()) {
          <div class="flex justify-center items-center py-20">
            <p class="text-text-muted dark:text-dark-text-muted text-lg">
              {{ 'Basic.loading' | translate }}
            </p>
          </div>
        } @else if (task()) {
          <main class="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 animate-fade-in">
            <div class="lg:col-span-2 space-y-6">
              <div class="rounded-lg shadow-soft p-6 dark:border-dark-border-primary border-border-primary border">
                <h1
                  class="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4 border-b border-border-primary dark:border-dark-border-primary pb-4"
                >
                  {{ task()!.description }}
                </h1>

                @if (task()!.additionalDescription) {
                  <div>
                    <h2 class="text-lg font-semibold text-text-secondary dark:text-dark-text-secondary mb-2">
                      {{ 'Task.additionalDescription' | translate }}
                    </h2>
                    <p class="text-text-primary dark:text-dark-text-primary leading-relaxed">
                      {{ task()!.additionalDescription }}
                    </p>
                  </div>
                }
              </div>

              @if (task()?.attachments && task()!.attachments.length > 0) {
                <div class="dark:border-dark-border-primary border-border-primary border rounded-lg shadow-soft p-6">
                  <h3 class="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
                    {{ 'Task.attachments' | translate }}
                  </h3>
                  <div class="flex flex-wrap justify-center items-center -m-2">
                    @for (attachment of task()!.attachments; track attachment.id) {
                      <div class="w-1/2 md:w-1/4 p-2 flex justify-center">
                        <div
                          class="group relative overflow-hidden rounded-lg border border-border-primary dark:border-dark-border-primary transition-shadow duration-200 hover:shadow-md"
                        >
                          @if (isImage(attachment.filename || attachment.originalName)) {
                            <div class="w-full h-32 flex items-center justify-center">
                              <app-image
                                [initialUrl]="attachment.url || null"
                                mode="preview"
                                format="square"
                                size="lg"
                                class="w-full h-full object-cover cursor-pointer"
                              />
                            </div>
                          } @else {
                            <a
                              [href]="attachment.url"
                              target="_blank"
                              class="flex flex-col items-center justify-center gap-2 p-3 bg-neutral-100 dark:bg-neutral-800 h-32 text-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
                            >
                              <ng-icon name="heroDocument" size="32" class="text-primary-500"></ng-icon>
                              <span class="text-xs text-text-secondary dark:text-dark-text-secondary break-all">{{
                                attachment.filename || attachment.originalName
                              }}</span>
                            </a>
                          }
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
                    <app-textarea
                      id="commentContent"
                      [control]="contentControl"
                      [placeholder]="'Task.commentPlaceholder' | translate"
                      [rows]="4"
                    ></app-textarea>
                    <app-error-message [input]="contentControl" />
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
                    <button
                      type="submit"
                      [disabled]="commentForm.invalid || submittingComment()"
                      class="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <ng-icon name="heroPaperAirplane" size="16"></ng-icon>
                      <span>
                        @if (submittingComment()) {
                          {{ 'Basic.submitting' | translate }}
                        } @else {
                          {{ 'Task.addComment' | translate }}
                        }
                      </span>
                    </button>
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
                                <app-textarea
                                  id="editingCommentContent"
                                  [control]="editingCommentControl"
                                  [placeholder]="'Task.commentPlaceholder' | translate"
                                  [rows]="3"
                                ></app-textarea>
                              }
                              <div class="mb-2">
                                <app-file-upload
                                  [multiple]="true"
                                  [maxFiles]="maxAttachmentsLimit"
                                  [maxSizeBytes]="5242880"
                                  accept="image/jpeg,image/png,image/gif,application/pdf,text/plain"
                                  (filesChange)="onEditCommentFilesChange($event)"
                                />
                              </div>
                              <div class="flex flex-wrap gap-2 mb-2">
                                @for (att of editingCommentAttachments; track att.id) {
                                  <div
                                    class="relative flex items-center border border-border-primary dark:border-dark-border-primary rounded-lg px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 shadow-sm transition-all duration-200 group w-full mb-2"
                                    [class.opacity-50]="att._markedForDelete"
                                  >
                                    <ng-icon
                                      name="heroDocument"
                                      size="18"
                                      class="text-primary-500 mr-2 flex-shrink-0"
                                    ></ng-icon>
                                    <span
                                      class="text-xs font-medium text-text-primary dark:text-dark-text-primary break-all flex-1 truncate"
                                      >{{ att.originalName || att.filename }}</span
                                    >
                                    <button
                                      type="button"
                                      (click)="markAttachmentForDelete(att)"
                                      class="ml-2 p-1 rounded-md outline-none border-none transition-colors duration-150 flex-shrink-0"
                                      [ngClass]="
                                        att._markedForDelete
                                          ? 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100'
                                          : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200'
                                      "
                                    >
                                      @if (att._markedForDelete) {
                                        <ng-icon name="heroTrash" size="16" class="align-middle"></ng-icon>
                                      }

                                      @if (!att._markedForDelete) {
                                        <ng-icon name="heroArrowLeft" size="16" class="align-middle"></ng-icon>
                                      }
                                    </button>
                                  </div>
                                }
                              </div>
                              <div class="flex gap-2">
                                <app-button
                                  type="button"
                                  (clicked)="onSaveEditComment()"
                                  [cssClass]="
                                    'px-4 py-1.5 bg-info-600 text-white rounded-md hover:bg-info-700 text-sm font-semibold transition-colors'
                                  "
                                >
                                  {{ 'Task.saveComment' | translate }}
                                </app-button>
                                <app-button
                                  type="button"
                                  (clicked)="onCancelEditComment()"
                                  [cssClass]="
                                    'px-4 py-1.5 bg-neutral-500 text-white rounded-md hover:bg-neutral-600 text-sm font-semibold transition-colors'
                                  "
                                >
                                  {{ 'Basic.cancel' | translate }}
                                </app-button>
                              </div>
                            </div>
                          } @else {
                            <div class="group">
                              <div class="flex justify-between items-center mb-1">
                                <span class="font-semibold text-text-primary dark:text-dark-text-primary">
                                  {{ comment.author.email }}
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
                              <div class="flex flex-wrap gap-2 mt-1">
                                <span class="text-xs text-text-muted dark:text-dark-text-muted">
                                  {{ 'Task.dateCreation' | translate }}:
                                  {{ comment.dateCreation | customDate: 'dd.MM.yyyy HH:mm' }}
                                </span>
                                <span class="text-xs text-text-muted dark:text-dark-text-muted">
                                  {{ 'Task.dateModification' | translate }}:
                                  {{ (comment.dateModification | customDate: 'dd.MM.yyyy HH:mm') || '-' }}
                                </span>
                              </div>
                              <p class="text-text-primary dark:text-dark-text-primary break-words">
                                {{ comment.content }}
                              </p>

                              @if (comment.attachments && comment.attachments.length > 0) {
                                <div class="flex flex-wrap justify-start -m-1 mt-2">
                                  @for (attachment of comment.attachments; track attachment.id) {
                                    <div class="w-1/2 sm:w-1/3 md:w-1/4 p-1">
                                      <div class="relative overflow-hidden rounded-md w-full">
                                        @if (isImage(attachment.filename || attachment.originalName)) {
                                          <div class="w-full overflow-hidden rounded-md">
                                            <app-image
                                              [initialUrl]="attachment.url || null"
                                              mode="preview"
                                              format="square"
                                              size="md"
                                              class="w-full h-full object-cover cursor-pointer"
                                            />
                                          </div>
                                        } @else {
                                          <a
                                            [href]="attachment.url"
                                            target="_blank"
                                            class="flex items-center gap-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-md h-20 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
                                          >
                                            <ng-icon
                                              name="heroDocument"
                                              size="20"
                                              class="text-blue-500 flex-shrink-0"
                                            ></ng-icon>
                                            <span
                                              class="text-xs text-text-primary dark:text-dark-text-primary truncate"
                                              >{{ attachment.filename || attachment.originalName }}</span
                                            >
                                          </a>
                                        }
                                      </div>
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
                @if (task()?.status) {
                  <div class="flex items-start gap-4">
                    <ng-icon
                      name="heroExclamationTriangle"
                      size="20"
                      class="flex-shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
                    ></ng-icon>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                        {{ 'Task.status' | translate }}
                      </h4>
                      <div class="flex items-center gap-2 mt-1">
                        <div class="w-3 h-3 rounded-full" [style.background-color]="task()?.status?.color"></div>
                        <p class="text-md font-semibold text-text-primary dark:text-dark-text-primary">
                          {{ getTranslatedName(task()?.status) }}
                        </p>
                      </div>
                    </div>
                  </div>
                }

                @if (task()!.priority) {
                  <div class="flex items-start gap-4">
                    <ng-icon
                      name="heroFlag"
                      size="20"
                      class="flex-shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
                    ></ng-icon>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                        {{ 'Task.priority' | translate }}
                      </h4>
                      <div class="flex items-center gap-2 mt-1">
                        <div class="w-3 h-3 rounded-full" [style.background-color]="task()!.priority.color"></div>
                        <p class="text-md font-semibold text-text-primary dark:text-dark-text-primary">
                          {{ getTranslatedName(task()!.priority) }}
                        </p>
                      </div>
                    </div>
                  </div>
                }

                @if (task()?.project) {
                  <div class="flex items-start gap-4">
                    <ng-icon
                      name="heroFolder"
                      size="20"
                      class="flex-shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
                    ></ng-icon>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                        {{ 'Task.project' | translate }}
                      </h4>
                      <p class="text-md font-semibold text-text-primary dark:text-dark-text-primary mt-1 break-words">
                        {{ task()?.project?.name }}
                      </p>
                    </div>
                  </div>
                }

                <div class="flex items-start gap-4">
                  <ng-icon
                    name="heroClock"
                    size="20"
                    class="flex-shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
                  ></ng-icon>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                      {{ 'Task.timeTracking' | translate }}
                    </h4>
                    <div class="text-md font-semibold text-text-primary dark:text-dark-text-primary mt-1">
                      <span [title]="'Task.workedTime' | translate">{{ formatHours(task()!.workedTime) }}</span>
                      <span class="mx-1 text-text-muted dark:text-dark-text-muted font-normal">/</span>
                      <span [title]="'Task.priceEstimation' | translate">{{
                        formatHours(task()!.priceEstimation)
                      }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <ng-icon
                    name="heroCalendar"
                    size="20"
                    class="flex-shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
                  ></ng-icon>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                      {{ 'Task.dates' | translate }}
                    </h4>
                    <div class="text-sm text-text-primary dark:text-dark-text-primary mt-1 space-y-1">
                      <p>
                        <span class="font-semibold">{{ 'Task.created' | translate }}:</span>
                        {{ task()!.dateCreation | customDate: 'dd.MM.yyyy' }}
                      </p>
                      <p>
                        <span class="font-semibold">{{ 'Task.modified' | translate }}:</span>
                        {{ (task()!.dateModification | customDate: 'dd.MM.yyyy') || '-' }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <ng-icon
                    name="heroUserGroup"
                    size="20"
                    class="flex-shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
                  ></ng-icon>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                      {{ 'Task.people' | translate }}
                    </h4>
                    <div class="mt-2 space-y-2 text-sm">
                      <p class="font-semibold text-text-primary dark:text-dark-text-primary break-words">
                        {{ 'Task.createdBy' | translate }}:
                        <span class="font-normal">{{ task()!.createdBy.email }}</span>
                      </p>

                      <h5 class="font-semibold text-text-primary dark:text-dark-text-primary pt-1">
                        {{ 'Task.assignedUsers' | translate }}:
                      </h5>
                      @if (task()!.assignedUsers && task()!.assignedUsers.length > 0) {
                        <div class="flex flex-wrap gap-2">
                          @for (user of task()!.assignedUsers; track user.id) {
                            <span
                              class="bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 px-2 py-1 rounded-full text-xs font-medium"
                              >{{ user.email }}</span
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
                      class="flex-shrink-0 text-text-secondary dark:text-dark-text-secondary mt-1"
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
  readonly taskId = input.required<string>();

  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly tasksService = inject(TasksService);
  protected readonly translateService = inject(TranslateService);
  protected readonly notificationService = inject(NotificationService);
  protected readonly modalService = inject(ModalService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authStateService = inject(AuthStateService);

  protected readonly task = signal<Task | null>(null);
  protected readonly loading = signal(true);
  protected readonly submittingComment = signal(false);
  protected readonly commentAttachments = signal<FileUploadItem[]>([]);

  protected readonly maxAttachmentsLimit = 4;

  protected editingCommentId: number | null = null;
  protected editingCommentContent: string = '';
  protected editingCommentAttachments: FileUploadItem[] = [];
  protected editingCommentExistingAttachments: any[] = [];
  protected editingCommentControl: FormControl | null = null;

  private readonly destroy$ = new Subject<void>();

  protected commentForm: FormGroup = this.formBuilder.group({
    content: ['', [Validators.required, Validators.minLength(1)]],
  });

  private currentLang: string = this.translateService.currentLang || 'pl';

  get contentControl(): FormControl {
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

  private loadTask(): void {
    this.loading.set(true);
    this.tasksService
      .getOne(+this.taskId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.task.set(response.data);
          this.loading.set(false);
        },
        error: error => {
          console.error('Error loading task:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Task.loadError'),
            NotificationTypeEnum.Error,
          );
          this.loading.set(false);
        },
        complete: () => {},
      });
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
    const projectId = task?.project?.id || this.route.snapshot.paramMap.get('id');
    if (task && projectId) {
      this.router.navigate(['/projects', projectId, 'tasks', 'edit', task.id]).then();
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

  private confirmDelete(): void {
    this.tasksService
      .remove(+this.taskId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showNotification(
            this.translateService.instant('Task.deleteSuccess'),
            NotificationTypeEnum.Success,
          );
          const projectId = this.route.snapshot.paramMap.get('id');
          if (projectId) {
            this.router.navigate(['/projects', projectId, 'tasks']).then();
          } else {
            this.router.navigate(['/projects']).then();
          }
        },
        error: error => {
          console.error('Error deleting task:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Task.deleteError'),
            NotificationTypeEnum.Error,
          );
        },
        complete: () => {},
      });
  }

  protected onSubmitComment(): void {
    if (this.commentForm.invalid || this.submittingComment()) {
      return;
    }

    this.submittingComment.set(true);
    const content = this.commentForm.get('content')?.value;

    const formData = new FormData();
    formData.append('content', content);

    const attachments = this.commentAttachments();
    attachments.forEach(attachment => {
      formData.append('attachments', attachment.file);
    });

    this.tasksService
      .createCommentWithFiles(+this.taskId(), formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showNotification(
            this.translateService.instant('Task.commentAdded'),
            NotificationTypeEnum.Success,
          );
          this.commentForm.reset();
          this.commentAttachments.set([]);
          this.loadTask();
        },
        error: (error: any) => {
          console.error('Error adding comment:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Task.commentError'),
            NotificationTypeEnum.Error,
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
  }

  protected isImage(filename: string): boolean {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  protected onEditComment(commentId: number, content: string): void {
    this.editingCommentControl = new FormControl(content, [Validators.required, Validators.minLength(1)]);
    this.editingCommentId = commentId;
    this.editingCommentContent = content;
    const comment = this.task()?.comments?.find(c => c.id === commentId);
    this.editingCommentExistingAttachments = comment?.attachments ? [...comment.attachments] : [];
    this.editingCommentAttachments = [];
  }

  protected onCancelEditComment(): void {
    this.editingCommentId = null;
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

    const deletedIds = this.editingCommentExistingAttachments.filter(a => a._markedForDelete).map(a => a.id);
    if (deletedIds.length > 0) {
      formData.append('attachmentsToDelete', JSON.stringify(deletedIds));
    }

    this.tasksService
      .updateCommentWithFiles(this.editingCommentId, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showNotification(
            this.translateService.instant('Task.commentUpdated'),
            NotificationTypeEnum.Success,
          );
          this.onCancelEditComment();
          this.loadTask();
        },
        error: error => {
          console.error('Error updating comment:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Task.commentUpdateError'),
            NotificationTypeEnum.Error,
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
    const token = this.authStateService.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.sub === comment.author.id;
    } catch {
      return false;
    }
  }

  protected onDeleteComment(commentId: number): void {
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
                    NotificationTypeEnum.Success,
                  );
                  this.loadTask();
                  return true;
                },
                error: error => {
                  console.error('Error deleting comment:', error);
                  this.notificationService.showNotification(
                    this.translateService.instant('Task.commentDeleteError'),
                    NotificationTypeEnum.Error,
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

  protected getContrastColor(backgroundColor: string): string {
    return getContrastColor(backgroundColor);
  }
}
