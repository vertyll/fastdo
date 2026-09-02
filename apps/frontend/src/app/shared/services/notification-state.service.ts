import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, OperatorFunction, catchError, map, of, tap } from 'rxjs';
import { AuthStateService } from '../../auth/data-access/auth.state.service';
import {
  NotificationDto,
  NotificationSettingsDto,
  NotificationWsEvent,
  UpdateNotificationSettingsDto,
} from '../defs/notification.defs';
import { NotificationApiService } from './notification-api.service';
import { NotificationWebSocketService } from './notification-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationStateService {
  private readonly notificationApiService = inject(NotificationApiService);
  private readonly authStateService = inject(AuthStateService);
  private readonly webSocketService = inject(NotificationWebSocketService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _notifications = signal<NotificationDto[]>([]);
  private readonly _settings = signal<NotificationSettingsDto | null>(null);
  private readonly _unreadCount = signal<number>(0);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public readonly notifications = this._notifications.asReadonly();
  public readonly settings = this._settings.asReadonly();
  public readonly unreadCount = this._unreadCount.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly webSocketConnected = computed(() => this.webSocketService.connectionStatus() === 'connected');

  constructor() {
    effect(() => (this.authStateService.isLoggedIn() ? this.load() : this.resetState()));

    this.webSocketService.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => this.handleWsEvent(event));
  }

  public markAsRead(id: string): Observable<number | null> {
    return this.notificationApiService.markAsRead([id]).pipe(
      tap(() => {
        this.updateNotifications(n => (n.id === id ? { ...n, isRead: true } : n));
        this.refreshUnreadCount();
      }),
      this.onError('Error marking notification as read:', 'Failed to mark notification as read'),
    );
  }

  public markAllAsRead(): Observable<number | null> {
    return this.notificationApiService.markAllAsRead().pipe(
      tap(() => {
        this.updateNotifications(n => ({ ...n, isRead: true }));
        this._unreadCount.set(0);
      }),
      this.onError('Error marking all notifications as read:', 'Failed to mark all notifications as read'),
    );
  }

  public dismiss(id: string): Observable<number | null> {
    return this.notificationApiService.dismiss([id]).pipe(
      tap(() => {
        this._notifications.update(current => current.filter(n => n.id !== id));
        this.refreshUnreadCount();
      }),
      this.onError('Error dismissing notification:', 'Failed to dismiss notification'),
    );
  }

  public dismissAll(): Observable<number | null> {
    return this.notificationApiService.dismissAll().pipe(
      tap(() => {
        this._notifications.set([]);
        this._unreadCount.set(0);
      }),
      this.onError('Error dismissing all notifications:', 'Failed to dismiss all notifications'),
    );
  }

  public updateSettings(settings: UpdateNotificationSettingsDto): Observable<NotificationSettingsDto> {
    return this.notificationApiService.updateSettings(settings, this._settings()?.version ?? null).pipe(
      tap(updated => this._settings.set(updated)),
      catchError(error => {
        console.error('Error updating notification settings:', error);
        this._error.set('Failed to update notification settings');
        throw error;
      }),
    );
  }

  public refreshNotifications(): void {
    if (this.authStateService.isLoggedIn()) {
      this.loadNotifications().subscribe();
    }
  }

  private load(): void {
    this.loadNotifications().subscribe();
    this.loadSettings().subscribe();
    this.refreshUnreadCount();
  }

  private handleWsEvent(event: NotificationWsEvent): void {
    switch (event.type) {
      case 'notification-received':
        if (event.notification) {
          this.prepend(event.notification);
        }
        return;
      case 'unread-count':
        if (event.unread !== undefined) {
          this._unreadCount.set(event.unread);
        }
        return;
      case 'connected':
        this.refreshNotifications();
        this.refreshUnreadCount();
        return;
      case 'disconnected':
        return;
    }
  }

  private prepend(notification: NotificationDto): void {
    this._notifications.update(current =>
      current.some(n => n.id === notification.id) ? current : [notification, ...current],
    );
  }

  private refreshUnreadCount(): void {
    if (!this.authStateService.isLoggedIn()) {
      return;
    }
    this.notificationApiService
      .getUnreadCount()
      .pipe(catchError(() => of(this._unreadCount())))
      .subscribe(unread => this._unreadCount.set(unread));
  }

  private updateNotifications(mapper: (n: NotificationDto) => NotificationDto): void {
    this._notifications.update(current => current.map(mapper));
  }

  private resetState(): void {
    this._notifications.set([]);
    this._settings.set(null);
    this._unreadCount.set(0);
    this._error.set(null);
  }

  private onError<T>(logMessage: string, userMessage: string): OperatorFunction<T, T | null> {
    return catchError<T, Observable<null>>((error: unknown) => {
      console.error(logMessage, error);
      this._error.set(userMessage);
      return of(null);
    });
  }

  private loadNotifications(): Observable<NotificationDto[]> {
    if (!this.authStateService.isLoggedIn()) {
      return of([]);
    }

    this._loading.set(true);
    this._error.set(null);

    return this.notificationApiService.getNotifications().pipe(
      map(page => page.items),
      catchError(error => {
        console.error('Error loading notifications:', error);
        this._error.set('Failed to load notifications');
        return of([]);
      }),
      tap(notifications => {
        this._notifications.set(notifications);
        this._loading.set(false);
      }),
    );
  }

  private loadSettings(): Observable<NotificationSettingsDto | null> {
    if (!this.authStateService.isLoggedIn()) {
      return of(null);
    }

    return this.notificationApiService.getSettings().pipe(
      catchError(error => {
        console.error('Error loading settings:', error);
        this._error.set('Failed to load settings');
        return of(null);
      }),
      tap(settings => this._settings.set(settings)),
    );
  }
}
