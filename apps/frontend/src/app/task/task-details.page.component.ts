import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft,
  heroCalendar,
  heroPaperAirplane,
  heroPencil,
  heroTrash,
} from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { jwtDecode } from 'jwt-decode';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/data-access/auth.service';
import { AuthStateService } from '../auth/data-access/auth.state.service';
import { ProjectCategoryApiService } from '../project/data-access/project-category.api.service';
import { ProjectRoleApiService } from '../project/data-access/project-role.api.service';
import { ProjectStatusApiService } from '../project/data-access/project-status.api.service';
import { ProjectsApiService } from '../project/data-access/project.api.service';
import { ButtonRoleEnum, ModalInputTypeEnum } from '../shared/enums/modal.enum';
import { NotificationTypeEnum } from '../shared/enums/notification.enum';
import { ModalService } from '../shared/services/modal.service';
import { NotificationService } from '../shared/services/notification.service';
import { TaskUpdatePayload } from '../shared/types/task.type';
import { PriorityApiService } from './data-access/priority.api.service';
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
  ],
  providers: [
    provideIcons({
      heroArrowLeft,
      heroCalendar,
      heroPencil,
      heroTrash,
      heroPaperAirplane,
    }),
  ],
  template: `
    <div class="container mx-auto p-4 max-w-4xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <button
          (click)="goBack()"
          class="flex items-center gap-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 transition-colors"
        >
          <ng-icon name="heroArrowLeft" size="20"></ng-icon>
          {{ 'Basic.back' | translate }}
        </button>

        @if (task()) {
          <div class="flex gap-2">
            <button
              (click)="editTask()"
              class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <ng-icon name="heroPencil" size="16"></ng-icon>
              {{ 'Basic.edit' | translate }}
            </button>
            <button
              (click)="deleteTask()"
              class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <ng-icon name="heroTrash" size="16"></ng-icon>
              {{ 'Basic.delete' | translate }}
            </button>
          </div>
        }
      </div>

      @if (loading()) {
        <div class="text-center py-8">
          {{ 'Basic.loading' | translate }}
        </div>
      } @else if (task()) {
        <!-- Task Details -->
        <div
          class="bg-white dark:bg-dark-surface-primary rounded-lg shadow-sm border border-border-primary dark:border-dark-border-primary p-6 mb-6"
        >
          <h1
            class="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4"
          >
            {{ 'Task.details' | translate }}
          </h1>

          <!-- Main Description -->
          <div class="mb-6">
            <h3
              class="text-lg font-semibold text-text-secondary dark:text-dark-text-secondary mb-2"
            >
              {{ 'Task.description' | translate }}
            </h3>
            <p
              class="text-text-primary dark:text-dark-text-primary whitespace-pre-wrap"
            >
              {{ task()!.description }}
            </p>
          </div>

          <!-- Additional Description -->
          @if (task()!.additionalDescription) {
            <div class="mb-6">
              <h3
                class="text-lg font-semibold text-text-secondary dark:text-dark-text-secondary mb-2"
              >
                {{ 'Task.additionalDescription' | translate }}
              </h3>
              <p
                class="text-text-primary dark:text-dark-text-primary whitespace-pre-wrap"
              >
                {{ task()!.additionalDescription }}
              </p>
            </div>
          }

          <!-- Task Info Grid -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
          >
            <!-- Price Estimation -->
            <div
              class="bg-gray-50 dark:bg-dark-surface-secondary rounded-lg p-4"
            >
              <h4
                class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2"
              >
                {{ 'Task.priceEstimation' | translate }}
              </h4>
              <p
                class="text-lg font-semibold text-text-primary dark:text-dark-text-primary"
              >
                {{ formatHours(task()!.priceEstimation) }}
              </p>
            </div>

            <!-- Worked Time -->
            <div
              class="bg-gray-50 dark:bg-dark-surface-secondary rounded-lg p-4"
            >
              <h4
                class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2"
              >
                {{ 'Task.workedTime' | translate }}
              </h4>
              <p
                class="text-lg font-semibold text-text-primary dark:text-dark-text-primary"
              >
                {{ formatHours(task()!.workedTime) }}
              </p>
            </div>

            <!-- Access Role -->
            <div
              class="bg-gray-50 dark:bg-dark-surface-secondary rounded-lg p-4"
            >
              <h4
                class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2"
              >
                {{ 'Task.accessRole' | translate }}
              </h4>
              <p
                class="text-lg font-semibold text-text-primary dark:text-dark-text-primary"
              >
                {{ task()!.accessRole ? getTranslatedName(task()!.accessRole) : ('Task.noAccessRoleSet' | translate) }}
              </p>
            </div>

            <!-- Priority -->
            @if (task()!.priority) {
              <div
                class="bg-gray-50 dark:bg-dark-surface-secondary rounded-lg p-4"
              >
                <h4
                  class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2"
                >
                  {{ 'Task.priority' | translate }}
                </h4>
                <div class="flex items-center gap-2">
                  <div
                    class="w-4 h-4 rounded-full"
                    [style.background-color]="task()!.priority.color"
                  ></div>
                  <p
                    class="text-lg font-semibold text-text-primary dark:text-dark-text-primary"
                  >
                    {{ getTranslatedName(task()!.priority) }}
                  </p>
                </div>
              </div>
            }

            <!-- Project -->
            @if (task()?.project) {
              <div
                class="bg-gray-50 dark:bg-dark-surface-secondary rounded-lg p-4"
              >
                <h4
                  class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2"
                >
                  {{ 'Task.project' | translate }}
                </h4>
                <p
                  class="text-lg font-semibold text-text-primary dark:text-dark-text-primary"
                >
                  {{ task()?.project?.name }}
                </p>
              </div>
            }

            <!-- Categories -->
            @if (task()?.categories && task()!.categories.length > 0) {
              <div
                class="bg-gray-50 dark:bg-dark-surface-secondary rounded-lg p-4"
              >
                <h4
                  class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2"
                >
                  {{ 'Task.categories' | translate }}
                </h4>
                <div class="flex flex-wrap gap-2">
                  @for (category of task()!.categories; track category.id) {
                    <div
                      class="flex items-center gap-2 bg-white dark:bg-dark-surface-primary rounded-full px-3 py-1 border border-border-primary dark:border-dark-border-primary"
                    >
                      <div
                        class="w-3 h-3 rounded-full"
                        [style.background-color]="category.color"
                      ></div>
                      <span
                        class="text-sm font-medium text-text-primary dark:text-dark-text-primary"
                      >
                        {{ getTranslatedName(category) }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Status -->
            @if (task()?.status) {
              <div
                class="bg-gray-50 dark:bg-dark-surface-secondary rounded-lg p-4"
              >
                <h4
                  class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2"
                >
                  {{ 'Task.status' | translate }}
                </h4>
                <div class="flex items-center gap-2">
                  <div
                    class="w-4 h-4 rounded-full"
                    [style.background-color]="task()?.status?.color"
                  ></div>
                  <p
                    class="text-lg font-semibold text-text-primary dark:text-dark-text-primary"
                  >
                    {{ getTranslatedName(task()?.status) }}
                  </p>
                </div>
              </div>
            }
          </div>

          <!-- Users -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Assigned Users -->
            <div
              class="bg-gray-50 dark:bg-dark-surface-secondary rounded-lg p-4"
            >
              <h4
                class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2"
              >
                {{ 'Task.assignedUsers' | translate }}
              </h4>
              @if (task()!.assignedUsers && task()!.assignedUsers.length > 0) {
                <div class="space-y-2">
                  @for (user of task()!.assignedUsers; track user.id) {
                    <div
                      class="flex items-center gap-2 bg-white dark:bg-dark-surface-primary rounded-md px-3 py-2 border border-border-primary dark:border-dark-border-primary"
                    >
                      <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span
                        class="text-sm font-medium text-text-primary dark:text-dark-text-primary"
                      >
                        {{ user.email }}
                      </span>
                    </div>
                  }
                </div>
              } @else {
                <p
                  class="text-sm text-text-muted dark:text-dark-text-muted italic"
                >
                  {{ 'Task.noAssignedUsers' | translate }}
                </p>
              }
            </div>

            <!-- Created By -->
            <div
              class="bg-gray-50 dark:bg-dark-surface-secondary rounded-lg p-4"
            >
              <h4
                class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2"
              >
                {{ 'Task.createdBy' | translate }}
              </h4>
              <p
                class="text-lg font-semibold text-text-primary dark:text-dark-text-primary"
              >
                {{ task()!.createdBy.email }}
              </p>
            </div>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Created Date -->
            <div
              class="bg-gray-50 dark:bg-dark-surface-secondary rounded-lg p-4"
            >
              <h4
                class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2"
              >
                {{ 'Task.created' | translate }}
              </h4>
              <p
                class="text-lg font-semibold text-text-primary dark:text-dark-text-primary"
              >
                {{ task()!.dateCreation | date: 'medium' }}
              </p>
            </div>

            <!-- Modified Date -->
            <div
              class="bg-gray-50 dark:bg-dark-surface-secondary rounded-lg p-4"
            >
              <h4
                class="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2"
              >
                {{ 'Task.modified' | translate }}
              </h4>
              <p
                class="text-lg font-semibold text-text-primary dark:text-dark-text-primary"
              >
                {{ task()!.dateModification | date: 'medium' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Comments Section -->
        <div
          class="bg-white dark:bg-dark-surface-primary rounded-lg shadow-sm border border-border-primary dark:border-dark-border-primary p-6"
        >
          <h2
            class="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4"
          >
            {{ 'Task.comments' | translate }}
            @if (task()!.comments && task()!.comments.length > 0) {
              <span
                class="text-sm font-normal text-text-muted dark:text-dark-text-muted"
                >({{ task()!.comments.length }})</span
              >
            }
          </h2>

          <!-- Add Comment Form -->
          <form
            [formGroup]="commentForm"
            (ngSubmit)="onSubmitComment()"
            class="mb-6"
          >
            <div class="mb-4">
              <label
                class="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2"
              >
                {{ 'Task.addComment' | translate }}
              </label>
              <textarea
                formControlName="content"
                rows="3"
                class="w-full px-3 py-2 border border-border-primary dark:border-dark-border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-surface-secondary dark:text-dark-text-primary resize-none"
                [placeholder]="'Task.commentPlaceholder' | translate"
              ></textarea>
              @if (
                commentForm.get('content')?.invalid &&
                commentForm.get('content')?.touched
              ) {
                <div class="text-red-500 text-sm mt-1">
                  {{ 'Task.commentRequired' | translate }}
                </div>
              }
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                [disabled]="commentForm.invalid || submittingComment()"
                class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ng-icon name="heroPaperAirplane" size="16"></ng-icon>
                @if (submittingComment()) {
                  {{ 'Basic.submitting' | translate }}
                } @else {
                  {{ 'Task.addComment' | translate }}
                }
              </button>
            </div>
          </form>

          <!-- Existing Comments -->
          @if (task()!.comments && task()!.comments.length > 0) {
            <div class="space-y-4">
              @for (comment of task()!.comments; track comment.id) {
                <div
                  class="border-b border-border-primary dark:border-dark-border-primary last:border-b-0 pb-4 last:pb-0"
                >
                  <div class="flex justify-between items-start mb-2">
                    <span
                      class="font-medium text-text-secondary dark:text-dark-text-secondary"
                    >
                      {{ comment.author.email }}
                    </span>
                    <div class="flex items-center gap-2">
                      <span
                        class="text-sm text-text-muted dark:text-dark-text-muted"
                      >
                        {{ comment.dateCreation | date: 'medium' }}
                      </span>
                      @if (canDeleteComment(comment)) {
                        <button
                          type="button"
                          (click)="onEditComment(comment.id, comment.content)"
                          class="text-blue-600 hover:text-blue-800 text-sm p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900"
                          [title]="'Task.editComment' | translate"
                        >
                          <ng-icon name="heroPencil" size="16"></ng-icon>
                        </button>
                        <button
                          type="button"
                          (click)="onDeleteComment(comment.id)"
                          class="text-red-600 hover:text-red-800 text-sm p-1 rounded hover:bg-red-50 dark:hover:bg-red-900"
                          [title]="'Task.deleteComment' | translate"
                        >
                          <ng-icon name="heroTrash" size="16"></ng-icon>
                        </button>
                      }
                    </div>
                  </div>
                  @if (editingCommentId === comment.id) {
                    <div class="space-y-2">
                      <textarea
                        [(ngModel)]="editingCommentContent"
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      ></textarea>
                      <div class="flex gap-2">
                        <button
                          type="button"
                          (click)="onSaveEditComment()"
                          class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          {{ 'Task.saveComment' | translate }}
                        </button>
                        <button
                          type="button"
                          (click)="onCancelEditComment()"
                          class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        >
                          {{ 'Basic.cancel' | translate }}
                        </button>
                      </div>
                    </div>
                  } @else {
                    <p
                      class="text-text-primary dark:text-dark-text-primary whitespace-pre-wrap"
                    >
                      {{ comment.content }}
                    </p>
                  }
                </div>
              }
            </div>
          } @else {
            <div
              class="text-center py-4 text-text-muted dark:text-dark-text-muted"
            >
              {{ 'Task.noComments' | translate }}
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-8 text-text-muted dark:text-dark-text-muted">
          {{ 'Task.notFound' | translate }}
        </div>
      }
    </div>
  `,
})
export class TaskDetailsPageComponent implements OnInit {
  readonly taskId = input.required<string>();

  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly tasksService = inject(TasksService);
  protected readonly translateService = inject(TranslateService);
  protected readonly notificationService = inject(NotificationService);
  protected readonly modalService = inject(ModalService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authStateService = inject(AuthStateService);
  private readonly priorityApiService = inject(PriorityApiService);
  private readonly projectCategoryApiService = inject(
    ProjectCategoryApiService,
  );
  private readonly projectStatusApiService = inject(ProjectStatusApiService);
  private readonly projectUsersApiService = inject(ProjectsApiService);
  private readonly projectRoleApiService = inject(ProjectRoleApiService);

  protected readonly task = signal<Task | null>(null);
  protected readonly loading = signal(true);
  protected readonly submittingComment = signal(false);

  protected readonly priorities = signal<Array<{ id: number; name: string }>>(
    [],
  );
  protected readonly categories = signal<Array<{ id: number; name: string }>>(
    [],
  );
  protected readonly statuses = signal<Array<{ id: number; name: string }>>([]);
  protected readonly projectUsers = signal<Array<{ id: number; name: string }>>(
    [],
  );
  protected readonly accessRoles = signal<Array<{ id: number; name: string }>>(
    [],
  );

  protected editingCommentId: number | null = null;
  protected editingCommentContent: string = '';

  protected commentForm: FormGroup = this.formBuilder.group({
    content: ['', [Validators.required, Validators.minLength(1)]],
  });

  ngOnInit(): void {
    this.loadTask();
  }

  private async loadTask(): Promise<void> {
    try {
      this.loading.set(true);
      const response = await firstValueFrom(
        this.tasksService.getOne(+this.taskId()),
      );
      this.task.set(response.data);
      await this.loadEditOptions();
    } catch (error) {
      this.notificationService.showNotification(
        this.translateService.instant('Task.loadError'),
        NotificationTypeEnum.Error,
      );
    } finally {
      this.loading.set(false);
    }
  }

  protected goBack(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.router.navigate(['/projects', projectId, 'tasks']);
    } else {
      this.router.navigate(['/projects']);
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
      this.router.navigate(['/projects', projectId, 'tasks', 'edit', task.id]);
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

  private async confirmDelete(): Promise<void> {
    try {
      await firstValueFrom(this.tasksService.remove(+this.taskId()));
      this.notificationService.showNotification(
        this.translateService.instant('Task.deleteSuccess'),
        NotificationTypeEnum.Success,
      );
      const projectId = this.route.snapshot.paramMap.get('id');
      if (projectId) {
        this.router.navigate(['/projects', projectId, 'tasks']);
      } else {
        this.router.navigate(['/projects']);
      }
    } catch (error) {
      this.notificationService.showNotification(
        this.translateService.instant('Task.deleteError'),
        NotificationTypeEnum.Error,
      );
    }
  }

  protected async onSubmitComment(): Promise<void> {
    if (this.commentForm.invalid || this.submittingComment()) {
      return;
    }

    try {
      this.submittingComment.set(true);
      const content = this.commentForm.get('content')?.value;

      await firstValueFrom(
        this.tasksService.createComment(+this.taskId(), { content }),
      );

      this.notificationService.showNotification(
        this.translateService.instant('Task.commentAdded'),
        NotificationTypeEnum.Success,
      );

      this.commentForm.reset();
      await this.loadTask();
    } catch (error) {
      this.notificationService.showNotification(
        this.translateService.instant('Task.commentError'),
        NotificationTypeEnum.Error,
      );
    } finally {
      this.submittingComment.set(false);
    }
  }

  protected onEditComment(commentId: number, content: string): void {
    this.editingCommentId = commentId;
    this.editingCommentContent = content;
  }

  protected onCancelEditComment(): void {
    this.editingCommentId = null;
    this.editingCommentContent = '';
  }

  protected async onSaveEditComment(): Promise<void> {
    if (!this.editingCommentId || !this.editingCommentContent.trim()) return;

    try {
      await firstValueFrom(
        this.tasksService.updateComment(this.editingCommentId, {
          content: this.editingCommentContent,
        }),
      );

      this.notificationService.showNotification(
        this.translateService.instant('Task.commentUpdated'),
        NotificationTypeEnum.Success,
      );

      this.onCancelEditComment();
      await this.loadTask();
    } catch (error) {
      this.notificationService.showNotification(
        this.translateService.instant('Task.commentUpdateError'),
        NotificationTypeEnum.Error,
      );
    }
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

  protected async onDeleteComment(commentId: number): Promise<void> {
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
          handler: async () => {
            try {
              await firstValueFrom(this.tasksService.deleteComment(commentId));
              this.notificationService.showNotification(
                this.translateService.instant('Task.commentDeleted'),
                NotificationTypeEnum.Success,
              );
              await this.loadTask();
              return true; // zamknij modal
            } catch (error) {
              this.notificationService.showNotification(
                this.translateService.instant('Task.commentDeleteError'),
                NotificationTypeEnum.Error,
              );
              return false; // nie zamykaj modala jeśli błąd
            }
          },
        },
      ],
    });
  }

  protected getTranslatedName(obj: any): string {
    if (!obj) return '';
    const lang = this.translateService.currentLang || 'pl';
    if (obj.translations && Array.isArray(obj.translations)) {
      const found = obj.translations.find((t: any) => t.lang === lang);
      if (found && found.name) return found.name;
      if (obj.translations[0]?.name) return obj.translations[0].name;
    }
    return obj.name || '';
  }

  private async loadEditOptions(): Promise<void> {
    try {
      const task = this.task();
      if (!task) return;

      const prioritiesResponse = await firstValueFrom(
        this.priorityApiService.getAll(),
      );
      if (prioritiesResponse.data) {
        this.priorities.set(prioritiesResponse.data);
      }

      const rolesResponse = await firstValueFrom(
        this.projectRoleApiService.getAll(),
      );
      if (rolesResponse.data) {
        this.accessRoles.set(rolesResponse.data);
      }

      if (task.project?.id) {
        const projectId = task.project.id;

        const categoriesResponse = await firstValueFrom(
          this.projectCategoryApiService.getByProjectId(projectId),
        );
        if (categoriesResponse.data) {
          this.categories.set(categoriesResponse.data);
        }

        const statusesResponse = await firstValueFrom(
          this.projectStatusApiService.getByProjectId(projectId),
        );
        if (statusesResponse.data) {
          this.statuses.set(statusesResponse.data);
        }

        const usersResponse = await firstValueFrom(
          this.projectUsersApiService.getProjectUsers(projectId),
        );
        if (usersResponse.data) {
          this.projectUsers.set(usersResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading edit options:', error);
    }
  }
}
