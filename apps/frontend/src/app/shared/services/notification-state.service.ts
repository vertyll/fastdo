import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, interval, of, startWith, switchMap, tap } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';
import { NotificationStatusEnum } from '../enums/notification-status.enum';
import { NotificationDto, NotificationSettingsDto, UpdateNotificationSettingsDto } from '../types/notification.type';
import { NotificationApiService } from './notification-api.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationStateService {
  private readonly _notificationRead = signal<number | null>(null);
  private readonly _notificationDeleted = signal<number | null>(null);

  public notificationRead = this._notificationRead.asReadonly();
  public notificationDeleted = this._notificationDeleted.asReadonly();

  public removeNotificationById(id: number): void {
    const current = this._notifications();
    if (Array.isArray(current)) {
      this._notifications.set(current.filter(n => n.id !== id));
    }
  }
  public removeNotificationByInvitationId(invitationId: number): void {
    const current = this._notifications();
    if (Array.isArray(current)) {
      this._notifications.set(current.filter(n => n.data?.invitationId !== invitationId));
    }
  }
  private readonly notificationApiService = inject(NotificationApiService);
  private readonly authService = inject(AuthService);

  private readonly _notifications = signal<NotificationDto[]>([]);
  private readonly _settings = signal<NotificationSettingsDto | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _webSocketConnected = signal<boolean>(false);

  public readonly notifications = this._notifications.asReadonly();
  public readonly settings = this._settings.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly webSocketConnected = this._webSocketConnected.asReadonly();

  public readonly unreadCount = computed(() => {
    const notifications = this._notifications();
    return Array.isArray(notifications)
      ? notifications.filter(n => n.status === NotificationStatusEnum.UNREAD).length
      : 0;
  });

  // Auto-refresh notifications every 30 seconds (only when WebSocket is not connected AND user is logged in)
  private readonly autoRefresh$ = interval(30000).pipe(
    startWith(0),
    filter(() => this.authService.isLoggedIn()),
    switchMap(() => {
      // Skip auto-refresh if WebSocket is connected
      if (this._webSocketConnected()) {
        return of(null);
      }
      return this.loadNotifications().pipe(
        catchError(() => of(null)),
      );
    }),
  );

  // Auto-refresh subscription (will be activated when component subscribes)
  public readonly autoRefreshSignal = toSignal(this.autoRefresh$, { initialValue: null });

  constructor() {
    // Only load if user is logged in
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.loadNotifications().subscribe();
        this.loadSettings().subscribe();
      } else {
        // Clear data when user logs out
        this._notifications.set([]);
        this._settings.set(null);
        this._error.set(null);
      }
    });

    this.setupWebSocketEventListeners();
  }

  public markAsRead(id: number) {
    return this.notificationApiService.markAsRead(id).pipe(
      tap(() => {
        // Update local state
        const currentNotifications = this._notifications();
        if (Array.isArray(currentNotifications)) {
          const updatedNotifications = currentNotifications.map(n =>
            n.id === id ? { ...n, status: NotificationStatusEnum.READ } : n
          );
          this._notifications.set(updatedNotifications);
        }
      }),
      catchError(error => {
        console.error('Error marking notification as read:', error);
        this._error.set('Failed to mark notification as read');
        return of(null);
      }),
    );
  }

  public markAllAsRead() {
    return this.notificationApiService.markAllAsRead().pipe(
      tap(() => {
        const currentNotifications = this._notifications();
        if (Array.isArray(currentNotifications)) {
          const updatedNotifications = currentNotifications.map(n => ({
            ...n,
            status: NotificationStatusEnum.READ,
          }));
          this._notifications.set(updatedNotifications);
        }
      }),
      catchError(error => {
        console.error('Error marking all notifications as read:', error);
        this._error.set('Failed to mark all notifications as read');
        return of(null);
      }),
    );
  }

  public deleteNotification(id: number) {
    return this.notificationApiService.deleteNotification(id).pipe(
      tap(() => {
        this._notifications.set(this._notifications().filter(n => n.id !== id));
      }),
      catchError(error => {
        console.error('Error deleting notification:', error);
        this._error.set('Failed to delete notification');
        return of(null);
      }),
    );
  }

  public clearAllNotifications() {
    return this.notificationApiService.clearAllNotifications().pipe(
      tap(() => {
        this._notifications.set([]);
      }),
      catchError(error => {
        console.error('Error clearing all notifications:', error);
        this._error.set('Failed to clear all notifications');
        return of(null);
      }),
    );
  }

  public updateSettings(settings: UpdateNotificationSettingsDto) {
    return this.notificationApiService.updateSettings(settings).pipe(
      tap(updatedSettings => {
        if (updatedSettings) {
          this._settings.set(updatedSettings);
        }
      }),
      catchError(error => {
        console.error('Error updating notification settings:', error);
        this._error.set('Failed to update notification settings');
        throw error; // Re-throw to let component handle the error
      }),
    );
  }

  public refreshNotifications(): void {
    if (this.authService.isLoggedIn()) {
      this.loadNotifications().subscribe();
    }
  }

  private setupWebSocketEventListeners(): void {
    window.addEventListener('websocket-connected', () => {
      this._webSocketConnected.set(true);
    });

    window.addEventListener('websocket-disconnected', () => {
      this._webSocketConnected.set(false);
    });

    window.addEventListener('notification-refresh', () => {
      this.refreshNotifications();
    });

    window.addEventListener('notification.read', (event: any) => {
      if (event?.detail?.notificationId) {
        this._notificationRead.set(event.detail.notificationId);
      }
    });
    window.addEventListener('notification.deleted', (event: any) => {
      if (event?.detail?.notificationId) {
        this._notificationDeleted.set(event.detail.notificationId);
      }
    });
  }

  private loadNotifications() {
    // Don't load if user is not logged in
    if (!this.authService.isLoggedIn()) {
      return of([]);
    }

    this._loading.set(true);
    this._error.set(null);

    return this.notificationApiService.getNotifications().pipe(
      catchError(error => {
        console.error('Error loading notifications:', error);
        this._error.set('Failed to load notifications');
        this._loading.set(false);
        return of([]);
      }),
      switchMap(notifications => {
        const notificationArray = Array.isArray(notifications) ? notifications : [];
        this._notifications.set(notificationArray);
        this._loading.set(false);
        return of(notificationArray);
      }),
    );
  }

  private loadSettings() {
    // Don't load if user is not logged in
    if (!this.authService.isLoggedIn()) {
      return of(null);
    }

    return this.notificationApiService.getSettings().pipe(
      catchError(error => {
        console.error('Error loading settings:', error);
        this._error.set('Failed to load settings');
        return of(null);
      }),
      switchMap(settings => {
        this._settings.set(settings);
        return of(settings);
      }),
    );
  }
}
