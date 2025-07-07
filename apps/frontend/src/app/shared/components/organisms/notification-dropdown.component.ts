import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBell, heroBellAlert, heroCog6Tooth, heroTrash } from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationTypeEnum } from '../../enums/notification.enum';
import { NotificationStateService } from '../../services/notification-state.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationDto } from '../../types/notification.type';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule, NgIconComponent, TranslateModule],
  viewProviders: [
    provideIcons({
      heroBell,
      heroBellAlert,
      heroTrash,
      heroCog6Tooth,
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
            class="absolute -top-1 -right-1 bg-danger-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
          >
            {{ unreadCount() > 99 ? '99+' : unreadCount() }}
          </span>
        }
      </button>

      @if (isDropdownOpen) {
        <div 
          class="absolute right-0 top-full mt-2 w-80 bg-surface-primary dark:bg-dark-surface-primary shadow-medium rounded-md py-2 border border-border-primary dark:border-dark-border-primary transition-colors duration-200 z-50"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between px-4 py-2 border-b border-border-primary dark:border-dark-border-primary">
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
              @if (notifications().length > 0) {
                <button
                  class="p-1 text-danger-500 hover:text-danger-600 dark:text-danger-400 dark:hover:text-danger-300 rounded-md hover:bg-danger-50 dark:hover:bg-danger-900"
                  (click)="clearAllNotifications()"
                  [title]="'Notifications.clearAll' | translate"
                >
                  <ng-icon name="heroTrash" size="16" />
                </button>
              }
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
                  [class.bg-primary-50]="notification.status === 'UNREAD'"
                  (click)="markAsRead(notification)"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-text-primary dark:text-dark-text-primary truncate">
                        {{ notification.title }}
                      </h4>
                      <p class="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                        {{ notification.message }}
                      </p>
                      <span class="text-xs text-text-secondary dark:text-dark-text-secondary mt-2 block">
                        {{ formatDate(notification.createdAt) }}
                      </span>
                    </div>
                    @if (notification.status === 'UNREAD') {
                      <div class="w-2 h-2 bg-primary-500 rounded-full mt-1 ml-2 flex-shrink-0"></div>
                    }
                  </div>
                </div>
              }
            }
          </div>

          @if (notifications().length > 0) {
            <div class="px-4 py-2 border-t border-border-primary dark:border-dark-border-primary flex items-center justify-between">
              <button
                class="flex items-center space-x-1 text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                (click)="navigateToSettings()"
              >
                <ng-icon name="heroCog6Tooth" size="14" />
                <span>{{ 'Notifications.settings' | translate }}</span>
              </button>
              
              <button
                class="flex items-center space-x-1 text-xs text-danger-500 hover:text-danger-600 dark:text-danger-400 dark:hover:text-danger-300"
                (click)="clearAllNotifications()"
              >
                <ng-icon name="heroTrash" size="14" />
                <span>{{ 'Notifications.clearAll' | translate }}</span>
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
    </div>

    @if (isDropdownOpen) {
      <div
        class="fixed inset-0 z-40"
        (click)="closeDropdown()"
      ></div>
    }
  `,
})
export class NotificationDropdownComponent {
  private readonly notificationStateService = inject(NotificationStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);

  protected readonly notifications = this.notificationStateService.notifications;
  protected readonly unreadCount = this.notificationStateService.unreadCount;
  protected readonly webSocketConnected = this.notificationStateService.webSocketConnected;

  protected isDropdownOpen: boolean = false;

  protected toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.notificationStateService.refreshNotifications();
    }
  }

  protected closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  protected async markAsRead(notification: NotificationDto): Promise<void> {
    if (notification.status === 'UNREAD') {
      await this.notificationStateService.markAsRead(notification.id);
    }
  }

  protected async markAllAsRead(): Promise<void> {
    await this.notificationStateService.markAllAsRead();
  }

  protected async clearAllNotifications(): Promise<void> {
    if (confirm(this.translateService.instant('Notifications.confirmClearAll'))) {
      try {
        await this.notificationStateService.clearAllNotifications();
        this.notificationService.showNotification(
          this.translateService.instant('Notifications.clearedAll'),
          NotificationTypeEnum.Success,
        );
      } catch (error) {
        this.notificationService.showNotification(
          this.translateService.instant('Notifications.clearError'),
          NotificationTypeEnum.Error,
        );
      }
    }
  }

  protected navigateToSettings(): void {
    this.closeDropdown();
    this.router.navigate(['/notification-settings']);
  }

  protected formatDate(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Teraz';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min temu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} godz. temu`;
    } else if (diffInDays < 7) {
      return `${diffInDays} dni temu`;
    } else {
      return d.toLocaleDateString('pl-PL');
    }
  }
}
