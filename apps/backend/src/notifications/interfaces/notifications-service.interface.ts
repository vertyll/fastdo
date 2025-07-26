import { CreateNotificationDto } from '../dtos/create-notification.dto';
import { UpdateNotificationSettingsDto } from '../dtos/update-notification-settings.dto';
import { NotificationSettings } from '../entities/notification-settings.entity';
import { Notification } from '../entities/notification.entity';

export interface INotificationsService {
  createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification | null>;
  getUserNotifications(userId: number, limit?: number): Promise<Notification[]>;
  getUnreadCount(userId: number): Promise<number>;
  markAsRead(notificationId: number, userId: number): Promise<void>;
  markAllAsRead(userId: number): Promise<void>;
  clearAllNotifications(userId: number): Promise<void>;
  getUserSettings(userId: number): Promise<NotificationSettings>;
  updateUserSettings(userId: number, updateDto: UpdateNotificationSettingsDto): Promise<NotificationSettings>;
}
