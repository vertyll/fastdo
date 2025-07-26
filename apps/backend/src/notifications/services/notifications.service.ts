import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/core/language/entities/language.entity';
import { I18nTranslations } from 'src/generated/i18n/i18n.generated';
import { Repository } from 'typeorm';
import { IMailService } from '../../core/mail/interfaces/mail-service.interface';
import { IMailServiceToken } from '../../core/mail/tokens/mail-service.token';
import { NotificationsWebsocketService } from '../../events/services/notifications-websocket.service';
import { User } from '../../users/entities/user.entity';
import { CreateNotificationDto } from '../dtos/create-notification.dto';
import { UpdateNotificationSettingsDto } from '../dtos/update-notification-settings.dto';
import { NotificationSettings } from '../entities/notification-settings.entity';
import { NotificationTranslation } from '../entities/notification-translation.entity';
import { Notification } from '../entities/notification.entity';
import { NotificationStatusEnum } from '../enums/notification-status.enum';
import { NotificationTypeEnum } from '../enums/notification-type.enum';
import { INotificationsService } from '../interfaces/notifications-service.interface';

@Injectable()
export class NotificationsService implements INotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationSettings) private readonly settingsRepository: Repository<NotificationSettings>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
    @Inject(IMailServiceToken) private readonly mailService: IMailService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly notificationWebSocketService: NotificationsWebsocketService,
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
        data: createNotificationDto.data,
        recipient,
      });
      notification = await this.notificationRepository.save(notification);

      const languages = await this.languageRepository.find({ where: { isActive: true } });
      notification.translations = [];

      for (const lang of languages) {
        const translation = new NotificationTranslation();

        const translatedContent = await this.getTranslatedContent(
          createNotificationDto.type,
          createNotificationDto,
          lang.code,
        );

        translation.title = translatedContent.title;
        translation.message = translatedContent.message;
        translation.language = lang;
        translation.notification = notification;

        await this.notificationRepository.manager.save(translation);
        notification.translations.push(translation);
      }

      const notificationEvent = {
        id: notification.id,
        type: notification.type,
        translations: notification.translations.map(t => ({
          id: t.id,
          title: t.title,
          message: t.message,
          language: t.language,
        })),
        recipientId: notification.recipient.id,
        data: notification.data,
        isRead: notification.status === NotificationStatusEnum.READ,
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
        status: NotificationStatusEnum.UNREAD,
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
      { status: NotificationStatusEnum.READ },
    );

    const notificationEvent = {
      id: notification.id,
      type: notification.type,
      translations: notification.translations.map(t => ({
        id: t.id,
        title: t.title,
        message: t.message,
        language: t.language,
      })),
      recipientId: notification.recipient.id,
      data: notification.data,
      isRead: true,
      dateCreation: notification.dateCreation,
    };
    await this.notificationWebSocketService.sendNotificationRead(notificationEvent);
  }

  public async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { recipient: { id: userId }, status: NotificationStatusEnum.UNREAD },
      { status: NotificationStatusEnum.READ },
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

  public async deleteNotification(userId: number, notificationId: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipient: { id: userId } },
      relations: ['recipient'],
    });
    if (!notification) {
      return;
    }
    await this.notificationRepository.delete({ id: notificationId, recipient: { id: userId } });
    await this.notificationWebSocketService.sendNotificationDeleted(notification.id, notification.recipient.id);
  }

  private shouldReceiveNotification(type: NotificationTypeEnum, settings: NotificationSettings): boolean {
    switch (type) {
      case NotificationTypeEnum.PROJECT_INVITATION:
        return settings.projectInvitations;
      case NotificationTypeEnum.TASK_ASSIGNED:
        return settings.taskAssignments;
      case NotificationTypeEnum.PROJECT_UPDATE:
        return settings.projectUpdates;
      case NotificationTypeEnum.TASK_COMPLETED:
        return settings.taskStatusChanges;
      case NotificationTypeEnum.SYSTEM:
        return settings.systemNotifications;
      default:
        return true;
    }
  }

  private async sendEmailNotification(recipient: User, notification: CreateNotificationDto): Promise<void> {
    try {
      const content = `<h2>${notification.title}</h2><p>${notification.message}</p>`;

      const invitationId =
        notification.type === NotificationTypeEnum.PROJECT_INVITATION && notification.data?.invitationId
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

  private async getTranslatedContent(
    type: NotificationTypeEnum,
    dto: CreateNotificationDto,
    langCode: string,
  ): Promise<{ title: string; message: string; }> {
    try {
      let title: string;
      let message: string;

      switch (type) {
        case NotificationTypeEnum.PROJECT_INVITATION:
          title = this.i18n.t('messages.Projects.notifications.invitationTitle', {
            lang: langCode,
            args: { projectName: dto.data?.projectName },
          });
          message = this.i18n.t('messages.Projects.notifications.invitationMessage', {
            lang: langCode,
            args: {
              inviterEmail: dto.data?.inviterEmail,
              projectName: dto.data?.projectName,
            },
          });
          break;

        case NotificationTypeEnum.TASK_ASSIGNED:
          title = this.i18n.t('messages.Tasks.assigned', {
            lang: langCode,
            args: { title: dto.data?.taskTitle },
          });
          message = this.i18n.t('messages.Tasks.assigned', {
            lang: langCode,
            args: { title: dto.data?.taskTitle },
          });
          break;

        case NotificationTypeEnum.TASK_COMPLETED:
          title = this.i18n.t('messages.Tasks.statusChanged', {
            lang: langCode,
            args: {
              title: dto.data?.taskTitle,
              status: dto.data?.status,
            },
          });
          message = this.i18n.t('messages.Tasks.statusChanged', {
            lang: langCode,
            args: {
              title: dto.data?.taskTitle,
              status: dto.data?.status,
            },
          });
          break;

        case NotificationTypeEnum.SYSTEM:
        default:
          title = dto.title;
          message = dto.message;
      }

      return { title, message };
    } catch (error) {
      console.error('Error translating notification content:', error);
      return {
        title: dto.title,
        message: dto.message,
      };
    }
  }
}
