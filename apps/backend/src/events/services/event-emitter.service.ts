import { Injectable, Logger } from '@nestjs/common';
import { IEventEmitterService } from '../interfaces/event-emitter.interface';
import { NotificationEventPayload } from '../types/notification-event.type';
import { SocketConnectionService } from './socket-connection.service';

@Injectable()
export class EventEmitterService implements IEventEmitterService {
  private readonly logger = new Logger(EventEmitterService.name);
  private gateway: any; // Will be injected later to avoid circular dependency

  constructor(private readonly socketConnectionService: SocketConnectionService) {}

  // Method to set gateway reference (called from module)
  public setGateway(gateway: any) {
    this.gateway = gateway;
  }

  public async emitToUser(userId: number, event: string, data: any): Promise<void> {
    if (this.gateway) {
      this.gateway.emitToUser(userId, event, data);
      this.logger.debug(`Emitted event '${event}' to user ${userId} via gateway`);
    } else {
      const userSockets = this.socketConnectionService.getUserSockets(userId);

      if (userSockets.length === 0) {
        this.logger.warn(`No active connections for user ${userId}`);
        return;
      }

      userSockets.forEach(socket => {
        try {
          socket.emit(event, data);
          this.logger.debug(`Emitted event '${event}' to user ${userId} socket ${socket.id}`);
        } catch (error) {
          this.logger.error(`Failed to emit event '${event}' to user ${userId} socket ${socket.id}:`, error);
        }
      });
    }
  }

  public async emitToRoom(room: string, event: string, data: any): Promise<void> {
    if (this.gateway) {
      this.gateway.emitToRoom(room, event, data);
      this.logger.debug(`Emitted event '${event}' to room '${room}' via gateway`);
    } else {
      this.logger.debug(`Gateway not available, cannot emit to room '${room}'`);
    }
  }

  public async emitNotification(payload: NotificationEventPayload): Promise<void> {
    const { recipientId, event, data } = payload;

    try {
      await this.emitToUser(recipientId, event, data);
      this.logger.log(`Notification sent to user ${recipientId}: ${event}`);
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${recipientId}:`, error);
    }
  }
}
