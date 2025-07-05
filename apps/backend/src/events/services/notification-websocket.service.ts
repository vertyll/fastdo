import { Inject, Injectable } from '@nestjs/common';
import { NotificationEvent as NotificationEventEnum } from '../enums/notification-event.enum';
import { IEventEmitterService } from '../interfaces/event-emitter.interface';
import { IEventEmitterServiceToken } from '../tokens/event-emitter-service.token';
import { NotificationEvent } from '../types/notification-event.type';

@Injectable()
export class NotificationWebSocketService {
  constructor(
    @Inject(IEventEmitterServiceToken) private readonly eventEmitter: IEventEmitterService,
  ) {}

  public async sendNotificationCreated(notification: NotificationEvent): Promise<void> {
    await this.eventEmitter.emitNotification({
      event: NotificationEventEnum.NOTIFICATION_CREATED,
      data: notification,
      recipientId: notification.recipientId,
    });
  }

  public async sendNotificationRead(notificationId: number, recipientId: number): Promise<void> {
    await this.eventEmitter.emitToUser(
      recipientId,
      NotificationEventEnum.NOTIFICATION_READ,
      { notificationId },
    );
  }

  public async sendNotificationDeleted(notificationId: number, recipientId: number): Promise<void> {
    await this.eventEmitter.emitToUser(
      recipientId,
      NotificationEventEnum.NOTIFICATION_DELETED,
      { notificationId },
    );
  }

  public async sendTaskAssigned(taskId: number, taskTitle: string, recipientId: number): Promise<void> {
    await this.eventEmitter.emitToUser(
      recipientId,
      'task.assigned',
      {
        taskId,
        title: taskTitle,
        message: 'Zostałeś przypisany do nowego zadania',
      },
    );
  }

  public async sendTaskStatusChanged(
    taskId: number,
    taskTitle: string,
    newStatus: string,
    recipientId: number,
  ): Promise<void> {
    await this.eventEmitter.emitToUser(
      recipientId,
      'task.status_changed',
      {
        taskId,
        title: taskTitle,
        newStatus,
        message: `Status zadania został zmieniony na: ${newStatus}`,
      },
    );
  }

  public async sendProjectInvitation(projectId: number, projectName: string, recipientId: number): Promise<void> {
    await this.eventEmitter.emitToUser(
      recipientId,
      'project.invitation',
      {
        projectId,
        projectName,
        message: `Zostałeś zaproszony do projektu: ${projectName}`,
      },
    );
  }

  public async sendCommentAdded(taskId: number, taskTitle: string, recipientId: number): Promise<void> {
    await this.eventEmitter.emitToUser(
      recipientId,
      'task.comment_added',
      {
        taskId,
        title: taskTitle,
        message: 'Dodano nowy komentarz do zadania',
      },
    );
  }
}
