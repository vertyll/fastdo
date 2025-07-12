import { NotificationTranslation } from '../../notifications/entities/notification-translation.entity';

export interface NotificationEvent {
  id: number;
  type: string;
  translations: NotificationTranslation[];
  recipientId: number;
  data?: Record<string, any>;
  isRead: boolean;
  dateCreation: Date;
}

export interface NotificationEventPayload {
  event: string;
  data: NotificationEvent;
  recipientId: number;
}
