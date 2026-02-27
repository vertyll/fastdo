import { Component, DestroyRef, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBell, heroBellAlert, heroCog6Tooth, heroTrash, heroXMark } from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, catchError, finalize, of } from 'rxjs';
import { ProjectsApiService } from 'src/app/project/data-access/project.api.service';
import { ButtonRoleEnum } from '../../enums/modal.enum';
import { NotificationStatusEnum } from '../../enums/notification-status.enum';
import { NotificationTypeEnum } from '../../enums/notification.enum';
import { ModalService } from '../../services/modal.service';
import { NotificationStateService } from '../../services/notification-state.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationDto } from '../../types/notification.type';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [NgIconComponent, TranslateModule],
  viewProviders: [
    provideIcons({
      heroBell,
      heroBellAlert,
      heroTrash,
      heroCog6Tooth,
      heroXMark,
    }),
  ],
  template: `
    <div class="relative">
      <button
        class="relative flex items-center justify-center p-2 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors duration-200"
        (click)="toggleDropdown()"
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

      @if (isDropdownOpen) {
        <!-- Mobile modal overlay when mobile context -->
        @if (isMobileContext()) {
          <div
            class="fixed inset-0 bg-black/50 z-80 flex items-start justify-center pt-16 p-4"
            (click)="closeDropdown()"
            (keydown.escape)="closeDropdown()"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
          >
            <div
              class="notification-dropdown-panel w-full max-w-sm bg-surface-primary dark:bg-dark-surface-primary shadow-medium rounded-md py-2 border border-border-primary dark:border-dark-border-primary transition-colors duration-200"
              (click)="$event.stopPropagation()"
              (keydown.escape)="$event.stopPropagation()"
              role="document"
              tabindex="-1"
            >
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
                    [title]="webSocketConnected() ? 'Connected' : 'Disconnected'"
                  ></div>
                </div>
                <div class="flex items-center space-x-2">
                  @if (unreadCount() > 0) {
                    <button
                      class="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                      (click)="markAllAsRead()"
                    >
                      {{ 'Notifications.markAllRead' | translate }}
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
                      class="px-4 py-3 hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary border-b border-border-primary dark:border-dark-border-primary last:border-b-0 cursor-pointer transition-colors duration-200"
                      (click)="markAsRead(notification)"
                      (keydown.enter)="markAsRead(notification)"
                      (keydown.space)="markAsRead(notification); $event.preventDefault()"
                      role="button"
                      tabindex="0"
                      [attr.aria-label]="
                        ('Notifications.markAsRead' | translate) + ': ' + getTranslation(notification).title
                      "
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                          <h4 class="text-sm font-medium text-text-primary dark:text-dark-text-primary truncate">
                            {{ getTranslation(notification).title }}
                          </h4>
                          <p class="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                            {{ getTranslation(notification).message }}
                          </p>
                          @if (
                            notification.type === 'project_invitation' &&
                            notification.data?.invitationId &&
                            (notification.status === NotificationStatusEnum.UNREAD ||
                              notification.status === NotificationStatusEnum.READ) &&
                            notification.data?.invitationStatus === 'pending' &&
                            notification.isLatestPendingInvitation
                          ) {
                            <div class="flex flex-col md:flex-row gap-2 mt-2 items-start md:items-center">
                              <span class="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                                {{ 'ProjectInvitation.projectInfo' | translate }}
                                <span class="font-bold">#{{ notification.data.projectId }}</span>
                              </span>
                              <div class="flex gap-2 mt-1 md:mt-0">
                                <button
                                  class="px-3 py-1 rounded-md text-xs font-semibold bg-primary-500 hover:bg-primary-600 text-white shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                  [disabled]="invitationLoading === notification.data.invitationId"
                                  (click)="
                                    $event.stopPropagation();
                                    acceptInvitation(notification.data.invitationId, notification)
                                  "
                                >
                                  @if (invitationLoading === notification.data.invitationId) {
                                    <span
                                      class="loader inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin align-middle mr-1"
                                    ></span>
                                  } @else {
                                    {{ 'Basic.accept' | translate }}
                                  }
                                </button>
                                <button
                                  class="px-3 py-1 rounded-md text-xs font-semibold bg-danger-500 hover:bg-danger-600 text-white shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-danger-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                  [disabled]="invitationLoading === notification.data.invitationId"
                                  (click)="
                                    $event.stopPropagation();
                                    rejectInvitation(notification.data.invitationId, notification)
                                  "
                                >
                                  @if (invitationLoading === notification.data.invitationId) {
                                    <span
                                      class="loader inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin align-middle mr-1"
                                    ></span>
                                  } @else {
                                    {{ 'Basic.delete' | translate }}
                                  }
                                </button>
                              </div>
                            </div>
                          }
                          <span class="text-xs text-text-secondary dark:text-dark-text-secondary mt-2 block">
                            {{ formatDate(notification.createdAt) }}
                          </span>
                        </div>
                        @if (notification.status === NotificationStatusEnum.UNREAD) {
                          <div class="w-2 h-2 bg-primary-500 rounded-full mt-1 ml-2 shrink-0"></div>
                        }
                      </div>
                    </div>
                  }
                }
              </div>

              @if (notifications().length > 0) {
                <div
                  class="px-4 py-2 border-t border-border-primary dark:border-dark-border-primary flex items-center justify-between"
                >
                  <button
                    class="flex items-center space-x-1 text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                    (click)="navigateToSettings()"
                  >
                    <ng-icon name="heroCog6Tooth" size="14" />
                    <span>{{ 'Notifications.settings' | translate }}</span>
                  </button>
                  <button
                    class="p-1 text-danger-500 hover:text-danger-600 dark:text-danger-400 dark:hover:text-danger-300 rounded-md hover:bg-danger-50 dark:hover:bg-danger-900"
                    (click)="clearAllNotifications()"
                    [title]="'Notifications.clearAll' | translate"
                  >
                    <ng-icon name="heroTrash" size="16" />
                  </button>
                </div>
              } @else {
                <div class="px-4 py-2 border-t border-border-primary dark:border-dark-border-primary text-center">
                  <button
                    class="flex items-center space-x-1 text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 mx-auto"
                    (click)="navigateToSettings()"
                  >
                    <ng-icon name="heroCog6Tooth" size="14" />
                    <span>{{ 'Notifications.settings' | translate }}</span>
                  </button>
                </div>
              }
            </div>
          </div>
        } @else {
          <!-- Regular dropdown for desktop -->
          <div
            class="notification-dropdown-panel absolute right-0 top-full mt-2 w-80 bg-surface-primary dark:bg-dark-surface-primary shadow-medium rounded-md py-2 border border-border-primary dark:border-dark-border-primary transition-colors duration-200 z-50"
            (click)="$event.stopPropagation()"
            (keydown.escape)="$event.stopPropagation()"
            role="menu"
            tabindex="-1"
          >
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
                  [title]="webSocketConnected() ? 'Connected' : 'Disconnected'"
                ></div>
              </div>
              <div class="flex items-center space-x-2">
                @if (unreadCount() > 0) {
                  <button
                    class="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                    (click)="markAllAsRead()"
                  >
                    {{ 'Notifications.markAllRead' | translate }}
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
                    class="px-4 py-3 hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary border-b border-border-primary dark:border-dark-border-primary last:border-b-0 transition-colors duration-200 group"
                  >
                    <div class="flex items-start justify-between">
                      <div
                        class="flex-1 min-w-0 cursor-pointer"
                        (click)="markAsRead(notification)"
                        (keydown.enter)="markAsRead(notification)"
                        (keydown.space)="markAsRead(notification); $event.preventDefault()"
                        role="button"
                        tabindex="0"
                        [attr.aria-label]="
                          ('Notifications.markAsRead' | translate) + ': ' + getTranslation(notification).title
                        "
                      >
                        <h4 class="text-sm font-medium text-text-primary dark:text-dark-text-primary truncate">
                          {{ getTranslation(notification).title }}
                        </h4>
                        <p class="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                          {{ getTranslation(notification).message }}
                        </p>
                        @if (
                          notification.type === 'project_invitation' &&
                          notification.data?.invitationId &&
                          (notification.status === NotificationStatusEnum.UNREAD ||
                            notification.status === NotificationStatusEnum.READ) &&
                          notification.data?.invitationStatus === 'pending' &&
                          notification.isLatestPendingInvitation
                        ) {
                          <div class="flex flex-col md:flex-row gap-2 mt-2 items-start md:items-center">
                            <span class="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                              {{ 'ProjectInvitation.projectInfo' | translate }}
                              <span class="font-bold">#{{ notification.data.projectId }}</span>
                            </span>
                            <div class="flex gap-2 mt-1 md:mt-0">
                              <button
                                class="px-3 py-1 rounded-md text-xs font-semibold bg-primary-500 hover:bg-primary-600 text-white shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                [disabled]="invitationLoading === notification.data.invitationId"
                                (click)="
                                  $event.stopPropagation();
                                  acceptInvitation(notification.data.invitationId, notification)
                                "
                              >
                                @if (invitationLoading === notification.data.invitationId) {
                                  <span
                                    class="loader inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin align-middle mr-1"
                                  ></span>
                                } @else {
                                  {{ 'Basic.accept' | translate }}
                                }
                              </button>
                              <button
                                class="px-3 py-1 rounded-md text-xs font-semibold bg-danger-500 hover:bg-danger-600 text-white shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-danger-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                [disabled]="invitationLoading === notification.data.invitationId"
                                (click)="
                                  $event.stopPropagation();
                                  rejectInvitation(notification.data.invitationId, notification)
                                "
                              >
                                @if (invitationLoading === notification.data.invitationId) {
                                  <span
                                    class="loader inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin align-middle mr-1"
                                  ></span>
                                } @else {
                                  {{ 'Basic.delete' | translate }}
                                }
                              </button>
                            </div>
                          </div>
                        }
                        <span class="text-xs text-text-secondary dark:text-dark-text-secondary mt-2 block">
                          {{ formatDate(notification.createdAt) }}
                        </span>
                      </div>
                      <div class="flex items-center space-x-2 ml-2">
                        @if (notification.status === NotificationStatusEnum.UNREAD) {
                          <div class="w-2 h-2 bg-primary-500 rounded-full shrink-0"></div>
                        }
                        <button
                          class="p-1 text-danger-500 hover:text-danger-600 dark:text-danger-400 dark:hover:text-danger-300 rounded-md hover:bg-danger-50 dark:hover:bg-danger-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          (click)="deleteNotification(notification, $event)"
                          [title]="'Notifications.delete' | translate"
                        >
                          <ng-icon name="heroXMark" size="14" />
                        </button>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>

            @if (notifications().length > 0) {
              <div
                class="px-4 py-2 border-t border-border-primary dark:border-dark-border-primary flex items-center justify-between"
              >
                <button
                  class="flex items-center space-x-1 text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                  (click)="navigateToSettings()"
                >
                  <ng-icon name="heroCog6Tooth" size="14" />
                  <span>{{ 'Notifications.settings' | translate }}</span>
                </button>
                <button
                  class="p-1 text-danger-500 hover:text-danger-600 dark:text-danger-400 dark:hover:text-danger-300 rounded-md hover:bg-danger-50 dark:hover:bg-danger-900"
                  (click)="clearAllNotifications()"
                  [title]="'Notifications.clearAll' | translate"
                >
                  <ng-icon name="heroTrash" size="16" />
                </button>
              </div>
            } @else {
              <div class="px-4 py-2 border-t border-border-primary dark:border-dark-border-primary text-center">
                <button
                  class="flex items-center space-x-1 text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 mx-auto"
                  (click)="navigateToSettings()"
                >
                  <ng-icon name="heroCog6Tooth" size="14" />
                  <span>{{ 'Notifications.settings' | translate }}</span>
                </button>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class NotificationDropdownComponent {
  protected readonly NotificationStatusEnum = NotificationStatusEnum;

  constructor(private readonly translateService: TranslateService) {
    this.currentLang = this.translateService.getCurrentLang() || 'pl';
    this.translateService.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
    this.listenNotificationSignals();
  }

  private listenNotificationSignals(): void {
    effect(() => {
      const readId = this.notificationStateService.notificationRead();
      if (readId) {
        this.notificationStateService.removeNotificationById(readId);
      }
      const deletedId = this.notificationStateService.notificationDeleted();
      if (deletedId) {
        this.notificationStateService.removeNotificationById(deletedId);
      }
    });
  }
  private readonly notificationStateService = inject(NotificationStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly modalService = inject(ModalService);
  private readonly router = inject(Router);
  private readonly projectsApi = inject(ProjectsApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly cancelInvitationRequests$ = new Subject<void>();

  public readonly isMobileContext = input<boolean>(false);
  public readonly isMobileMenuOpen = input<boolean>(false);

  protected readonly notifications = (): NotificationDto[] => {
    const all = this.notificationStateService.notifications();
    const latestInvitationMap = new Map<number, NotificationDto>();
    for (const n of all) {
      if (n.type === 'project_invitation' && n.data?.invitationId && n.data?.invitationStatus === 'pending') {
        const id = n.data.invitationId;
        const prev = latestInvitationMap.get(id);
        const nDate = new Date(n.data.invitationDateUpdated || n.updatedAt || n.createdAt);
        const prevDate = prev ? new Date(prev.data.invitationDateUpdated || prev.updatedAt || prev.createdAt) : null;
        if (!prev || !prevDate || nDate > prevDate) {
          latestInvitationMap.set(id, n);
        }
      }
    }
    return all.map(n => {
      if (n.type === 'project_invitation' && n.data?.invitationId && n.data?.invitationStatus === 'pending') {
        const latest = latestInvitationMap.get(n.data.invitationId);
        return { ...n, isLatestPendingInvitation: latest?.id === n.id };
      }
      return n;
    });
  };
  protected readonly unreadCount = this.notificationStateService.unreadCount;
  protected readonly webSocketConnected = this.notificationStateService.webSocketConnected;

  protected isDropdownOpen: boolean = false;
  protected invitationLoading: number | null = null;
  protected currentLang: string = 'pl';

  protected getTranslation(notification: NotificationDto): { title: string; message: string } {
    if (notification.translations && notification.translations.length > 0) {
      return notification.translations.find(t => t.language.code === this.currentLang) || notification.translations[0];
    }
    // fallback
    return { title: '', message: '' };
  }

  protected toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.notificationStateService.refreshNotifications();
    }
  }

  protected closeDropdown(): void {
    this.isDropdownOpen = false;
    this.cancelInvitationRequests$.next();
  }

  protected markAsRead(notification: NotificationDto): void {
    if (notification.status === NotificationStatusEnum.UNREAD) {
      this.notificationStateService
        .markAsRead(notification.id)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError(error => {
            console.error('Error marking notification as read:', error);
            return of(null);
          }),
        )
        .subscribe();
    }
  }

  protected markAllAsRead(): void {
    this.notificationStateService
      .markAllAsRead()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Error marking all notifications as read:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Notifications.markAllReadError'),
            NotificationTypeEnum.Error,
          );
          return of(null);
        }),
      )
      .subscribe();
  }

  protected clearAllNotifications(): void {
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
          text: this.translateService.instant('Basic.delete'),
          handler: () => {
            this.notificationStateService
              .clearAllNotifications()
              .pipe(
                takeUntilDestroyed(this.destroyRef),
                catchError(error => {
                  console.error('Error clearing notifications:', error);
                  this.notificationService.showNotification(
                    this.translateService.instant('Notifications.clearError'),
                    NotificationTypeEnum.Error,
                  );
                  return of(null);
                }),
              )
              .subscribe(result => {
                if (result) {
                  this.notificationService.showNotification(
                    this.translateService.instant('Notifications.clearedAll'),
                    NotificationTypeEnum.Success,
                  );
                }
              });
            return true;
          },
        },
      ],
    });
  }

  protected deleteNotification(notification: NotificationDto, event: Event): void {
    event.stopPropagation();

    this.notificationStateService
      .deleteNotification(notification.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Error deleting notification:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Notifications.clearError'),
            NotificationTypeEnum.Error,
          );
          return of(null);
        }),
      )
      .subscribe(result => {
        if (result) {
          this.notificationService.showNotification(
            this.translateService.instant('Basic.deleteTitle') + ': ' + this.getTranslation(notification).title,
            NotificationTypeEnum.Success,
          );
        }
      });
  }

  protected navigateToSettings(): void {
    this.closeDropdown();
    this.router.navigate(['/notification-settings']).then();
  }

  protected formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return this.translateService.instant('Notifications.timeNow');
    } else if (diffInMinutes < 60) {
      return this.translateService.instant('Notifications.timeMinutesAgo', { minutes: diffInMinutes });
    } else if (diffInHours < 24) {
      return this.translateService.instant('Notifications.timeHoursAgo', { hours: diffInHours });
    } else if (diffInDays < 7) {
      return this.translateService.instant('Notifications.timeDaysAgo', { days: diffInDays });
    } else {
      const locale = this.translateService.getCurrentLang() || 'pl';
      return d.toLocaleDateString(locale);
    }
  }

  protected acceptInvitation(invitationId: number, notification: NotificationDto): void {
    this.invitationLoading = invitationId;
    this.projectsApi
      .acceptInvitation({ invitationId })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.invitationLoading = null;
        }),
        catchError(error => {
          console.error('Error accepting invitation:', error);
          this.notificationService.showNotification(
            this.translateService.instant('ProjectInvitation.acceptError'),
            NotificationTypeEnum.Error,
          );
          return of(null);
        }),
      )
      .subscribe(result => {
        if (result) {
          this.notificationService.showNotification(
            this.translateService.instant('ProjectInvitation.acceptSuccess'),
            NotificationTypeEnum.Success,
          );
          this.notificationStateService
            .deleteNotification(notification.id)
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              catchError(error => {
                console.error('Error deleting notification:', error);
                return of(null);
              }),
            )
            .subscribe(() => {
              this.notificationStateService.refreshNotifications();
              this.closeDropdown();
            });
        }
      });
  }

  protected rejectInvitation(invitationId: number, notification: NotificationDto): void {
    this.invitationLoading = invitationId;
    this.projectsApi
      .rejectInvitation({ invitationId })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.invitationLoading = null;
        }),
        catchError(error => {
          console.error('Error rejecting invitation:', error);
          this.notificationService.showNotification(
            this.translateService.instant('ProjectInvitation.rejectError'),
            NotificationTypeEnum.Error,
          );
          return of(null);
        }),
      )
      .subscribe(result => {
        if (result) {
          this.notificationService.showNotification(
            this.translateService.instant('ProjectInvitation.rejectSuccess'),
            NotificationTypeEnum.Success,
          );
          this.notificationStateService
            .deleteNotification(notification.id)
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              catchError(error => {
                console.error('Error deleting notification:', error);
                return of(null);
              }),
            )
            .subscribe(() => {
              this.notificationStateService.refreshNotifications();
              this.closeDropdown();
            });
        }
      });
  }
}
