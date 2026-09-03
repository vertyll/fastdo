import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBell, heroBellAlert, heroCog6Tooth, heroTrash, heroXMark } from '@ng-icons/heroicons/outline';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, finalize, of } from 'rxjs';
import { ProjectsApiService } from '../../../project/data-access/project.api.service';
import { NotificationDto } from '../../defs/notification.defs';
import { ButtonRoleEnum } from '../../enums/modal.enum';
import { NotificationTypeEnum } from '../../enums/notification-type.enum';
import { ToastTypeEnum } from '../../enums/toast-type.enum';
import { ModalService } from '../../services/modal.service';
import { NotificationStateService } from '../../services/notification-state.service';
import { NotificationService } from '../../services/notification.service';
import { DropdownComponent, DropdownMenuDirective } from '../atoms/dropdown.component';
import { NotificationDetailsComponent } from '../molecules/notification-details.component';
import { SpinnerComponent } from '../atoms/spinner.component';

const TASK_NOTIFICATION_TYPES = new Set([
  NotificationTypeEnum.TASK_CREATED,
  NotificationTypeEnum.TASK_ASSIGNED,
  NotificationTypeEnum.TASK_STATUS_CHANGED,
  NotificationTypeEnum.TASK_COMMENT_ADDED,
]);

@Component({
  selector: 'app-notification-dropdown',
  imports: [NgIconComponent, TranslatePipe, SpinnerComponent, DropdownComponent, DropdownMenuDirective],
  viewProviders: [provideIcons({ heroBell, heroBellAlert, heroCog6Tooth, heroTrash, heroXMark })],
  template: `
    <app-dropdown [closeSignal]="dropdownCloseTrigger()">
      <button
        dropdownTrigger
        class="relative flex items-center justify-center p-2 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors duration-200"
        (click)="onTriggerClick()"
        [title]="'Notifications.title' | translate"
      >
        <ng-icon
          [name]="unreadCount() > 0 ? 'heroBellAlert' : 'heroBell'"
          size="20"
          [class]="unreadCount() > 0 ? 'text-primary-500' : 'text-text-secondary dark:text-dark-text-secondary'"
        />

        @if (unreadCount() > 0) {
          <span
            class="absolute -top-1 -right-1 bg-danger-500 text-white text-xs font-bold rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1"
          >
            {{ unreadCount() > 99 ? '99+' : unreadCount() }}
          </span>
        }
      </button>

      <div *appDropdownMenu class="w-[calc(100vw-2rem)] sm:w-96 md:w-80 pt-2">
        <div
          class="flex items-center justify-between px-4 py-2 border-b border-border-primary dark:border-dark-border-primary"
        >
          <div class="flex items-center space-x-2">
            <h3 class="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
              {{ 'Notifications.title' | translate }}
            </h3>
            <div
              class="w-2 h-2 rounded-full"
              [class]="webSocketConnected() ? 'bg-success-500' : 'bg-danger-500'"
              [title]="(webSocketConnected() ? 'Notifications.live' : 'Notifications.offline') | translate"
            ></div>
          </div>
          <div class="flex items-center space-x-3">
            @if (unreadCount() > 0) {
              <button
                class="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                (click)="markAllAsRead()"
              >
                {{ 'Notifications.markAllRead' | translate }}
              </button>
            }
            @if (notifications().length > 0) {
              <button
                class="text-xs text-text-secondary hover:text-danger-500 dark:text-dark-text-secondary dark:hover:text-danger-400"
                (click)="confirmClearAll()"
              >
                {{ 'Notifications.clearAll' | translate }}
              </button>
            }
          </div>
        </div>

        <div class="max-h-96 overflow-y-auto">
          @if (notifications().length === 0) {
            <div class="px-4 py-6 text-center text-text-secondary dark:text-dark-text-secondary text-sm">
              {{ 'Notifications.noNotifications' | translate }}
            </div>
          } @else {
            @for (notification of notifications(); track notification.id) {
              <div
                class="px-4 py-3 hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary border-b border-border-primary dark:border-dark-border-primary last:border-b-0 transition-colors duration-200"
              >
                <div class="flex items-start justify-between">
                  <div
                    class="flex-1 min-w-0 cursor-pointer"
                    (click)="openDetails(notification)"
                    (keydown.enter)="openDetails(notification)"
                    (keydown.space)="openDetails(notification); $event.preventDefault()"
                    role="button"
                    tabindex="0"
                    [attr.aria-label]="'Notifications.details' | translate"
                  >
                    <p class="text-sm text-text-primary dark:text-dark-text-primary">
                      {{ notification.messageKey | translate: notification.params }}
                    </p>

                    @if (isAnswerableInvitation(notification)) {
                      <div class="flex gap-2 mt-2">
                        <button
                          class="px-3 py-1 rounded-md text-xs font-semibold bg-primary-500 hover:bg-primary-600 text-white shadow transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                          [disabled]="invitationLoading() === notification.subjectId"
                          (click)="$event.stopPropagation(); acceptInvitation(notification)"
                        >
                          @if (invitationLoading() === notification.subjectId) {
                            <app-spinner />
                          } @else {
                            {{ 'Basic.accept' | translate }}
                          }
                        </button>
                        <button
                          class="px-3 py-1 rounded-md text-xs font-semibold bg-danger-500 hover:bg-danger-600 text-white shadow transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                          [disabled]="invitationLoading() === notification.subjectId"
                          (click)="$event.stopPropagation(); rejectInvitation(notification)"
                        >
                          @if (invitationLoading() === notification.subjectId) {
                            <app-spinner />
                          } @else {
                            {{ 'Basic.reject' | translate }}
                          }
                        </button>
                      </div>
                    }

                    <span class="text-xs text-text-secondary dark:text-dark-text-secondary mt-2 block">
                      {{ formatDate(notification.createdAt) }}
                    </span>
                  </div>

                  <div class="flex items-center shrink-0 ml-2 mt-1 space-x-2">
                    @if (!notification.isRead) {
                      <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
                    }
                    <button
                      class="text-text-secondary hover:text-danger-500 dark:text-dark-text-secondary dark:hover:text-danger-400 transition-colors duration-150"
                      (click)="$event.stopPropagation(); dismiss(notification)"
                      [title]="'Notifications.dismiss' | translate"
                      [attr.aria-label]="'Notifications.dismiss' | translate"
                    >
                      <ng-icon name="heroXMark" size="16" />
                    </button>
                  </div>
                </div>
              </div>
            }
          }
        </div>

        <div class="px-4 py-2 border-t border-border-primary dark:border-dark-border-primary text-center">
          <button
            class="flex items-center space-x-1 text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 mx-auto"
            (click)="navigateToSettings()"
          >
            <ng-icon name="heroCog6Tooth" size="14" />
            <span>{{ 'Notifications.settings' | translate }}</span>
          </button>
        </div>
      </div>
    </app-dropdown>
  `,
})
export class NotificationDropdownComponent {
  private readonly notificationStateService = inject(NotificationStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly projectsApi = inject(ProjectsApiService);
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly isMobileContext = input<boolean>(false);
  public readonly isMobileMenuOpen = input<boolean>(false);
  public readonly closeSignal = input<number>(0);

  protected readonly dropdownCloseTrigger = signal<number>(0);
  protected readonly invitationLoading = signal<string | null>(null);

  protected readonly notifications = this.notificationStateService.notifications;
  protected readonly unreadCount = this.notificationStateService.unreadCount;
  protected readonly webSocketConnected = this.notificationStateService.webSocketConnected;

  private readonly newestInvitationNotificationIds = computed(() => {
    const newest = new Map<string, NotificationDto>();
    for (const notification of this.notifications()) {
      if (notification.type !== NotificationTypeEnum.PROJECT_INVITATION || !notification.subjectId) {
        continue;
      }
      const previous = newest.get(notification.subjectId);
      if (!previous || notification.createdAt > previous.createdAt) {
        newest.set(notification.subjectId, notification);
      }
    }
    return new Set([...newest.values()].map(notification => notification.id));
  });

  constructor() {
    effect(() => this.handleExternalCloseSignal());
  }

  protected isAnswerableInvitation(notification: NotificationDto): boolean {
    return (
      notification.type === NotificationTypeEnum.PROJECT_INVITATION &&
      notification.subjectId !== null &&
      this.newestInvitationNotificationIds().has(notification.id)
    );
  }

  protected onTriggerClick(): void {
    this.notificationStateService.refreshNotifications();
  }

  protected closeDropdown(): void {
    this.dropdownCloseTrigger.set(Date.now());
  }

  protected markAsRead(notification: NotificationDto): void {
    if (notification.isRead) {
      return;
    }
    this.notificationStateService.markAsRead(notification.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  protected markAllAsRead(): void {
    this.notificationStateService.markAllAsRead().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  protected dismiss(notification: NotificationDto): void {
    this.notificationStateService.dismiss(notification.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  protected confirmClearAll(): void {
    this.modalService.present({
      title: this.translateService.instant('Notifications.clearAll'),
      message: this.translateService.instant('Notifications.confirmClearAll'),
      buttons: [
        {
          role: ButtonRoleEnum.Cancel,
          text: this.translateService.instant('Basic.cancel'),
        },
        {
          role: ButtonRoleEnum.Ok,
          text: this.translateService.instant('Notifications.clearAll'),
          handler: () => this.clearAll(),
        },
      ],
    });
  }

  protected openDetails(notification: NotificationDto): void {
    this.markAsRead(notification);
    this.closeDropdown();

    this.modalService.present({
      title: this.translateService.instant('Notifications.details'),
      components: [
        {
          component: NotificationDetailsComponent,
          data: { notification, receivedAt: this.formatDate(notification.createdAt) },
        },
      ],
      buttons: [
        ...(this.routeOf(notification)
          ? [
              {
                role: ButtonRoleEnum.Ok,
                text: this.translateService.instant('Notifications.goToSubject'),
                handler: () => this.navigateToSubject(notification),
              },
            ]
          : []),
        {
          role: ButtonRoleEnum.Reject,
          text: this.translateService.instant('Notifications.dismiss'),
          handler: () => this.dismiss(notification),
        },
        {
          role: ButtonRoleEnum.Cancel,
          text: this.translateService.instant('Basic.close'),
        },
      ],
    });
  }

  private clearAll(): void {
    this.notificationStateService.dismissAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  private navigateToSubject(notification: NotificationDto): void {
    const route = this.routeOf(notification);
    if (route) {
      this.router.navigate(route).then();
    }
  }

  private routeOf(notification: NotificationDto): string[] | null {
    if (!notification.projectId) {
      return null;
    }
    if (TASK_NOTIFICATION_TYPES.has(notification.type) && notification.subjectId) {
      return ['/projects', notification.projectId, 'tasks', notification.subjectId];
    }
    if (notification.type === NotificationTypeEnum.PROJECT_MEMBER_JOINED) {
      return ['/projects', notification.projectId, 'tasks'];
    }
    return null;
  }

  protected acceptInvitation(notification: NotificationDto): void {
    this.answerInvitation(notification, true);
  }

  protected rejectInvitation(notification: NotificationDto): void {
    this.answerInvitation(notification, false);
  }

  protected navigateToSettings(): void {
    this.closeDropdown();
    this.router.navigate(['/notification-settings']).then();
  }

  protected formatDate(value: string): string {
    return new Date(value).toLocaleString(this.translateService.getCurrentLang() || 'pl');
  }

  private answerInvitation(notification: NotificationDto, accept: boolean): void {
    const invitationId = notification.subjectId;
    if (!invitationId) {
      return;
    }

    this.invitationLoading.set(invitationId);
    const request$ = accept
      ? this.projectsApi.acceptInvitation({ invitationId })
      : this.projectsApi.rejectInvitation({ invitationId });

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          this.notificationService.showNotification(
            this.translateService.instant('ProjectInvitation.responseError'),
            ToastTypeEnum.Error,
          );
          console.error('Invitation response failed:', error);
          return of(null);
        }),
        finalize(() => this.invitationLoading.set(null)),
      )
      .subscribe(response => {
        if (response) {
          this.notificationStateService.refreshNotifications();
        }
      });
  }

  private handleExternalCloseSignal(): void {
    if (this.closeSignal() > 0) {
      this.dropdownCloseTrigger.set(this.closeSignal());
    }
  }
}
