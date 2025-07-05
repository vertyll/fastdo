export interface NotificationEvent {
  id: number;
  type: string;
  title: string;
  message: string;
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
