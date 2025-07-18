import { NotificationEventPayload } from '../types/notification-event.type';

export interface IEventEmitterService {
  emitToUser(userId: number, event: string, data: any): Promise<void>;
  emitToRoom(room: string, event: string, data: any): Promise<void>;
  emitNotification(payload: NotificationEventPayload): Promise<void>;
}
