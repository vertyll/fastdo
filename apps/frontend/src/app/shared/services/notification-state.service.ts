import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, interval, Observable, of, OperatorFunction, startWith, switchMap, tap } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';
import {
  NotificationDto,
  NotificationSettingsDto,
  NotificationWsEvent,
  UpdateNotificationSettingsDto,
} from '../defs/notification.defs';
import { NotificationStatusEnum } from '../enums/notification-status.enum';
import { NotificationApiService } from './notification-api.service';
import { NotificationWebSocketService } from './notification-websocket.service';

const AUTO_REFRESH_INTERVAL_MS = 30_000;

@Injectable({
  providedIn: 'root',
})
export class NotificationStateService {
  private readonly notificationApiService = inject(NotificationApiService);
  private readonly authService = inject(AuthService);
  private readonly webSocketService = inject(NotificationWebSocketService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _notifications = signal<NotificationDto[]>([]);
  private readonly _settings = signal<NotificationSettingsDto | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _webSocketConnected = signal<boolean>(false);
  private readonly _notificationRead = signal<number | null>(null);
  private readonly _notificationDeleted = signal<number | null>(null);

  public readonly notifications = this._notifications.asReadonly();
  public readonly settings = this._settings.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly webSocketConnected = this._webSocketConnected.asReadonly();
  public readonly notificationRead = this._notificationRead.asReadonly();
  public readonly notificationDeleted = this._notificationDeleted.asReadonly();

  public readonly unreadCount = computed(() => {
    const notifications = this._notifications();
    return Array.isArray(notifications)
      ? notifications.filter(n => n.status === NotificationStatusEnum.UNREAD).length
      : 0;
  });

  // Auto-refresh notifications every 30 seconds (only when WebSocket is not connected AND user is logged in)
  private readonly autoRefresh$ = interval(AUTO_REFRESH_INTERVAL_MS).pipe(
    startWith(0),
    filter(() => this.authService.isLoggedIn()),
    switchMap(() => {
      if (this._webSocketConnected()) {
        return of(null);
      }
      return this.loadNotifications().pipe(catchError(() => of(null)));
    }),
  );

  public readonly autoRefreshSignal = toSignal(this.autoRefresh$, { initialValue: null });

  constructor() {
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.loadNotifications().subscribe();
        this.loadSettings().subscribe();
      } else {
        this.resetState();
      }
    });

    this.subscribeToWebSocketEvents();
  }

  public markAsRead(id: number): Observable<any> {
    return this.notificationApiService.markAsRead(id).pipe(
      tap(() => this.updateNotifications(n => (n.id === id ? { ...n, status: NotificationStatusEnum.READ } : n))),
      this.handleError('Error marking notification as read:', 'Failed to mark notification as read'),
    );
  }

  public markAllAsRead(): Observable<any> {
    return this.notificationApiService.markAllAsRead().pipe(
      tap(() => this.updateNotifications(n => ({ ...n, status: NotificationStatusEnum.READ }))),
      this.handleError('Error marking all notifications as read:', 'Failed to mark all notifications as read'),
    );
  }

  public deleteNotification(id: number): Observable<any> {
    return this.notificationApiService.deleteNotification(id).pipe(
      tap(() => this.filterNotifications(n => n.id !== id)),
      this.handleError('Error deleting notification:', 'Failed to delete notification'),
    );
  }

  public clearAllNotifications(): Observable<any> {
    return this.notificationApiService.clearAllNotifications().pipe(
      tap(() => this._notifications.set([])),
      this.handleError('Error clearing all notifications:', 'Failed to clear all notifications'),
    );
  }

  public updateSettings(settings: UpdateNotificationSettingsDto): Observable<any> {
    return this.notificationApiService.updateSettings(settings).pipe(
      tap(updatedSettings => {
        if (updatedSettings) {
          this._settings.set(updatedSettings);
        }
      }),
      catchError(error => {
        console.error('Error updating notification settings:', error);
        this._error.set('Failed to update notification settings');
        throw error;
      }),
    );
  }

  public refreshNotifications(): void {
    if (this.authService.isLoggedIn()) {
      this.loadNotifications().subscribe();
    }
  }

  public removeNotificationById(id: number): void {
    this.filterNotifications(n => n.id !== id);
  }

  public removeNotificationByInvitationId(invitationId: number): void {
    this.filterNotifications(n => n.data?.invitationId !== invitationId);
  }

  private subscribeToWebSocketEvents(): void {
    this.webSocketService.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => this.handleWsEvent(event));
  }

  private handleWsEvent(event: NotificationWsEvent): void {
    switch (event.type) {
      case 'connected':
        this._webSocketConnected.set(true);
        return;
      case 'disconnected':
        this._webSocketConnected.set(false);
        return;
      case 'notification-refresh':
        this.refreshNotifications();
        return;
      case 'notification-read':
        if (event.payload?.notificationId) {
          this._notificationRead.set(event.payload.notificationId);
        }
        return;
      case 'notification-deleted':
        if (event.payload?.notificationId) {
          this._notificationDeleted.set(event.payload.notificationId);
        }
        return;
    }
  }

  private updateNotifications(mapper: (n: NotificationDto) => NotificationDto): void {
    const current = this._notifications();
    if (Array.isArray(current)) {
      this._notifications.set(current.map(mapper));
    }
  }

  private filterNotifications(predicate: (n: NotificationDto) => boolean): void {
    const current = this._notifications();
    if (Array.isArray(current)) {
      this._notifications.set(current.filter(predicate));
    }
  }

  private resetState(): void {
    this._notifications.set([]);
    this._settings.set(null);
    this._error.set(null);
  }

  private handleError<T>(logMessage: string, userMessage: string): OperatorFunction<T, T | null> {
    return catchError<T, Observable<null>>((error: unknown) => {
      console.error(logMessage, error);
      this._error.set(userMessage);
      return of(null);
    });
  }

  private loadNotifications(): Observable<NotificationDto[]> {
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

  private loadSettings(): Observable<any> {
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
