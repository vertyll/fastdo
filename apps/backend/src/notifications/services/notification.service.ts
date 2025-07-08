import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMailService } from '../../core/mail/interfaces/mail-service.interface';
import { IMailServiceToken } from '../../core/mail/tokens/mail-service.token';
import { NotificationWebSocketService } from '../../events/services/notification-websocket.service';
import { User } from '../../users/entities/user.entity';
import { CreateNotificationDto } from '../dtos/create-notification.dto';
import { UpdateNotificationSettingsDto } from '../dtos/update-notification-settings.dto';
import { NotificationSettings } from '../entities/notification-settings.entity';
import { Notification } from '../entities/notification.entity';
import { NotificationStatus } from '../enums/notification-status.enum';
import { NotificationType } from '../enums/notification-type.enum';
import { INotificationService } from '../interfaces/notification-service.interface';

@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationSettings) private readonly settingsRepository: Repository<NotificationSettings>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(IMailServiceToken) private readonly mailService: IMailService,
    private readonly notificationWebSocketService: NotificationWebSocketService,
  ) {}

  public async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification | null> {
    const recipient = await this.userRepository.findOneByOrFail({ id: createNotificationDto.recipientId });

    const settings = await this.getUserSettings(createNotificationDto.recipientId);

    if (!this.shouldReceiveNotification(createNotificationDto.type, settings)) {
      return null;
    }

    let notification: Notification | null = null;
    if (settings.appNotifications) {
      notification = this.notificationRepository.create({
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        data: createNotificationDto.data,
        recipient,
      });
      notification = await this.notificationRepository.save(notification);

      const notificationEvent = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        recipientId: notification.recipient.id,
        data: notification.data,
        isRead: notification.status === NotificationStatus.READ,
        dateCreation: notification.dateCreation,
      };
      await this.notificationWebSocketService.sendNotificationCreated(notificationEvent);
    }

    if (settings.emailNotifications && createNotificationDto.sendEmail) {
      await this.sendEmailNotification(recipient, createNotificationDto);
    }

    return notification;
  }

  public async getUserNotifications(userId: number, limit: number = 50): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { recipient: { id: userId } },
      order: { dateCreation: 'DESC' },
      take: limit,
      relations: ['recipient'],
    });
  }

  public async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: {
        recipient: { id: userId },
        status: NotificationStatus.UNREAD,
      },
    });
  }

  public async markAsRead(notificationId: number, userId: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipient: { id: userId } },
      relations: ['recipient'],
    });

    if (!notification) {
      return;
    }

    await this.notificationRepository.update(
      { id: notificationId, recipient: { id: userId } },
      { status: NotificationStatus.READ },
    );

    // Send notification via WebSocket
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const notificationEvent = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      recipientId: notification.recipient.id,
      data: notification.data,
      isRead: true,
      dateCreation: notification.dateCreation,
    };
    await this.notificationWebSocketService.sendNotificationRead(notification.id, notification.recipient.id);
  }

  public async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { recipient: { id: userId }, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ },
    );
  }

  public async clearAllNotifications(userId: number): Promise<void> {
    await this.notificationRepository.delete({
      recipient: { id: userId },
    });
  }

  public async getUserSettings(userId: number): Promise<NotificationSettings> {
    let settings = await this.settingsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!settings) {
      const user = await this.userRepository.findOneByOrFail({ id: userId });
      settings = this.settingsRepository.create({ user });
      settings = await this.settingsRepository.save(settings);
    }

    return settings;
  }

  public async updateUserSettings(
    userId: number,
    updateDto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    const settings = await this.getUserSettings(userId);

    Object.assign(settings, updateDto);
    return this.settingsRepository.save(settings);
  }

  private shouldReceiveNotification(type: NotificationType, settings: NotificationSettings): boolean {
    switch (type) {
      case NotificationType.PROJECT_INVITATION:
        return settings.projectInvitations;
      case NotificationType.TASK_ASSIGNED:
        return settings.taskAssignments;
      case NotificationType.PROJECT_UPDATE:
        return settings.projectUpdates;
      case NotificationType.TASK_COMPLETED:
        return settings.taskStatusChanges;
      case NotificationType.SYSTEM:
        return settings.systemNotifications;
      default:
        return true;
    }
  }

  private async sendEmailNotification(recipient: User, notification: CreateNotificationDto): Promise<void> {
    try {
      const content = `<h2>${notification.title}</h2><p>${notification.message}</p>`;

      const invitationId = notification.type === NotificationType.PROJECT_INVITATION && notification.data?.invitationId
        ? notification.data.invitationId
        : undefined;

      await this.mailService.sendNotificationEmail(
        recipient.email,
        notification.title,
        content,
        invitationId,
      );
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }
}
