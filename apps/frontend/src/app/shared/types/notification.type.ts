export interface NotificationDto {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  status: 'UNREAD' | 'READ';
  createdAt: Date;
  updatedAt: Date;
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
