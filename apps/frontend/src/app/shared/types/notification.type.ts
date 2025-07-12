import { Language } from 'src/app/core/models/Language';

export interface NotificationDto {
  id: number;
  type: string;
  data?: any;
  status: NotificationStatus;
  createdAt: Date;
  updatedAt: Date;
  translations: NotificationTranslation[];
}

export interface NotificationTranslation {
  id: number;
  title: string;
  message: string;
  language: Language;
}

type NotificationStatus = 'UNREAD' | 'READ';

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
