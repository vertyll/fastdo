import { Language } from 'src/app/core/models/Language';
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

export interface CreateNotificationDto {
  type: string;
  title: string;
  message: string;
  recipientId: number;
  data?: any;
  sendEmail?: boolean;
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
