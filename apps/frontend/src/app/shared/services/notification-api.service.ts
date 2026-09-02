import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiPaginatedResponse, ApiResponse } from '../defs/api-response.defs';
import {
  NotificationDto,
  NotificationSettingsDto,
  UnreadCountDto,
  UpdateNotificationSettingsDto,
} from '../defs/notification.defs';
import { HttpApiService } from './http-api.service';

const NOTIFICATIONS = '/notifications';

@Injectable({
  providedIn: 'root',
})
export class NotificationApiService extends HttpApiService {
  public getNotifications(page = 0, size = 20): Observable<ApiPaginatedResponse<NotificationDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<ApiPaginatedResponse<NotificationDto>>>(`${this.baseUrl}${NOTIFICATIONS}`, { params })
      .pipe(map(response => response.data));
  }

  public getUnreadCount(): Observable<number> {
    return this.http
      .get<ApiResponse<UnreadCountDto>>(`${this.baseUrl}${NOTIFICATIONS}/unread-count`)
      .pipe(map(response => response.data.unread));
  }

  public markAsRead(ids: string[]): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${this.baseUrl}${NOTIFICATIONS}/mark-read`, { notificationIds: ids })
      .pipe(map(response => response.data));
  }

  public markAllAsRead(): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${this.baseUrl}${NOTIFICATIONS}/mark-all-read`, {})
      .pipe(map(response => response.data));
  }

  public dismiss(ids: string[]): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${this.baseUrl}${NOTIFICATIONS}/dismiss`, { notificationIds: ids })
      .pipe(map(response => response.data));
  }

  public dismissAll(): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${this.baseUrl}${NOTIFICATIONS}/dismiss-all`, {})
      .pipe(map(response => response.data));
  }

  public getSettings(): Observable<NotificationSettingsDto> {
    return this.http
      .get<ApiResponse<NotificationSettingsDto>>(`${this.baseUrl}${NOTIFICATIONS}/settings`)
      .pipe(map(response => response.data));
  }

  public updateSettings(
    settings: UpdateNotificationSettingsDto,
    version: number | null,
  ): Observable<NotificationSettingsDto> {
    const headers = version === null ? undefined : new HttpHeaders({ 'If-Match': `W/"${version}"` });
    return this.http
      .put<ApiResponse<NotificationSettingsDto>>(`${this.baseUrl}${NOTIFICATIONS}/settings`, settings, { headers })
      .pipe(map(response => response.data));
  }
}
