import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, interval, of, startWith, switchMap } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';
import { NotificationDto, NotificationSettingsDto, UpdateNotificationSettingsDto } from '../types/notification.type';
import { NotificationApiService } from './notification-api.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationStateService {
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
    return Array.isArray(notifications) ? notifications.filter(n => n.status === 'UNREAD').length : 0;
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

  public async markAsRead(id: number): Promise<void> {
    try {
      await this.notificationApiService.markAsRead(id).toPromise();

      // Update local state
      const currentNotifications = this._notifications();
      if (Array.isArray(currentNotifications)) {
        const updatedNotifications = currentNotifications.map(n => n.id === id ? { ...n, status: 'READ' as const } : n);
        this._notifications.set(updatedNotifications);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      this._error.set('Failed to mark notification as read');
    }
  }

  public async markAllAsRead(): Promise<void> {
    try {
      await this.notificationApiService.markAllAsRead().toPromise();

      // Update local state
      const currentNotifications = this._notifications();
      if (Array.isArray(currentNotifications)) {
        const updatedNotifications = currentNotifications.map(n => ({
          ...n,
          status: 'READ' as const,
        }));
        this._notifications.set(updatedNotifications);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      this._error.set('Failed to mark all notifications as read');
    }
  }

  public async deleteNotification(id: number): Promise<void> {
    try {
      await this.notificationApiService.deleteNotification(id).toPromise();
      this._notifications.set(this._notifications().filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      this._error.set('Failed to delete notification');
    }
  }

  public async clearAllNotifications(): Promise<void> {
    try {
      await this.notificationApiService.clearAllNotifications().toPromise();

      this._notifications.set([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      this._error.set('Failed to clear all notifications');
    }
  }

  public async updateSettings(settings: UpdateNotificationSettingsDto): Promise<void> {
    try {
      const updatedSettings = await this.notificationApiService.updateSettings(settings).toPromise();
      if (updatedSettings) {
        this._settings.set(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      this._error.set('Failed to update notification settings');
    }
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
