export interface NotificationEventTranslation {
  id: number;
  title: string;
  message: string;
  language: any;
}

export interface NotificationEvent {
  id: number;
  type: string;
  translations: NotificationEventTranslation[];
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
