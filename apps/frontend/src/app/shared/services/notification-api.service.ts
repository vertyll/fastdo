import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../types/api-response.type';
import { NotificationDto, NotificationSettingsDto, UpdateNotificationSettingsDto, CreateNotificationDto } from '../types/notification.type';

@Injectable({
  providedIn: 'root',
})
export class NotificationApiService {
  private readonly http = inject(HttpClient);

  private get baseUrl(): string {
    return `${environment.backendUrl}/api/notifications`;
  }

  public getNotifications(): Observable<NotificationDto[]> {
    return this.http.get<ApiResponse<NotificationDto[]>>(`${this.baseUrl}/me`).pipe(
      map(response => response.data),
    );
  }

  public markAsRead(id: number): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/read`, {}).pipe(
      map(() => void 0),
    );
  }

  public markAllAsRead(): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/me/read-all`, {}).pipe(
      map(() => void 0),
    );
  }

  public clearAllNotifications(): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/me/clear-all`).pipe(
      map(() => void 0),
    );
  }

  public getSettings(): Observable<NotificationSettingsDto> {
    return this.http.get<ApiResponse<NotificationSettingsDto>>(`${this.baseUrl}/settings`).pipe(
      map(response => response.data),
    );
  }

  public updateSettings(settings: UpdateNotificationSettingsDto): Observable<NotificationSettingsDto> {
    return this.http.patch<ApiResponse<NotificationSettingsDto>>(`${this.baseUrl}/settings`, settings).pipe(
      map(response => response.data),
    );
  }

  public createNotification(notification: CreateNotificationDto): Observable<NotificationDto> {
    return this.http.post<ApiResponse<NotificationDto>>(this.baseUrl, notification).pipe(
      map(response => response.data),
    );
  }
}
