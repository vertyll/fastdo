import { NotificationTypeEnum } from '../enums/notification-type.enum';

export interface NotificationDto {
  id: string;
  type: NotificationTypeEnum;
  messageKey: string;
  params: Record<string, string>;
  projectId: string | null;
  subjectId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  version: number | null;
}

export interface NotificationSettingsDto {
  mutedTypes: NotificationTypeEnum[];
  emailEnabledTypes: NotificationTypeEnum[];
  availableTypes: NotificationTypeEnum[];
  version: number | null;
}

export interface UpdateNotificationSettingsDto {
  mutedTypes: NotificationTypeEnum[];
  emailEnabledTypes: NotificationTypeEnum[];
}

export interface UnreadCountDto {
  unread: number;
}

export type NotificationWsEventType = 'connected' | 'disconnected' | 'notification-received' | 'unread-count';

export interface NotificationWsEvent {
  type: NotificationWsEventType;
  notification?: NotificationDto;
  unread?: number;
}
