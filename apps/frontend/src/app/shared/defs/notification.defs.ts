import { Language } from 'src/app/core/defs/core.defs';
import { NotificationStatusEnum } from '../enums/notification-status.enum';

export interface NotificationDto {
  id: number;
  type: string;
  data?: any;
  status: NotificationStatusEnum;
  createdAt: Date;
  updatedAt: Date;
  translations: NotificationTranslation[];
  isLatestPendingInvitation?: boolean;
}

export interface NotificationTranslation {
  id: number;
  title: string;
  message: string;
  language: Language;
}

export interface NotificationSettingsDto {
  id: number;
  appNotifications: boolean;
  emailNotifications: boolean;
  projectInvitations: boolean;
  taskAssignments: boolean;
  taskComments: boolean;
  taskStatusChanges: boolean;
  projectUpdates: boolean;
  systemNotifications: boolean;
}

export type NotificationWsEventType =
  | 'connected'
  | 'disconnected'
  | 'notification-refresh'
  | 'notification-read'
  | 'notification-deleted';

export interface NotificationWsEvent {
  type: NotificationWsEventType;
  payload?: { notificationId?: number; [key: string]: any };
}

export interface UpdateNotificationSettingsDto {
  appNotifications?: boolean;
  emailNotifications?: boolean;
  projectInvitations?: boolean;
  taskAssignments?: boolean;
  taskComments?: boolean;
  taskStatusChanges?: boolean;
  projectUpdates?: boolean;
  systemNotifications?: boolean;
}
