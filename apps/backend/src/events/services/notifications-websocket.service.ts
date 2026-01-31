import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { NotificationEventEnum } from '../enums/notification-event.enum';
import { IEventEmitterService } from '../interfaces/event-emitter.interface';
import { IEventEmitterServiceToken } from '../tokens/event-emitter-service.token';
import { NotificationEvent } from '../types/notification-event.type';

@Injectable()
export class NotificationsWebsocketService {
  constructor(
    @Inject(IEventEmitterServiceToken) private readonly eventEmitter: IEventEmitterService,
    private readonly i18n: I18nService<I18nTranslations>,
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
  ) {}

  public async sendNotificationCreated(notification: NotificationEvent): Promise<void> {
    await this.eventEmitter.emitNotification({
      event: NotificationEventEnum.NOTIFICATION_CREATED,
      data: notification,
      recipientId: notification.recipientId,
    });
  }

  public async sendNotificationRead(notification: NotificationEvent): Promise<void> {
    await this.eventEmitter.emitToUser(notification.recipientId, NotificationEventEnum.NOTIFICATION_READ, notification);
  }

  public async sendNotificationDeleted(notificationId: number, recipientId: number): Promise<void> {
    await this.eventEmitter.emitToUser(recipientId, NotificationEventEnum.NOTIFICATION_DELETED, { notificationId });
  }

  public async sendTaskAssigned(taskId: number, taskTitle: string, recipientId: number): Promise<void> {
    const languages = await this.languageRepository.find({ where: { isActive: true } });
    const translations = languages.map(lang => ({
      lang: lang.code,
      title: this.i18n.t('messages.Tasks.assigned.title' as any, { lang: lang.code, args: { title: taskTitle } }),
      message: this.i18n.t('messages.Tasks.assigned.message' as any, { lang: lang.code, args: { title: taskTitle } }),
    }));
    await this.eventEmitter.emitToUser(recipientId, 'task.assigned', {
      taskId,
      translations,
      recipientId,
    });
  }

  public async sendTaskStatusChanged(
    taskId: number,
    taskTitle: string,
    newStatus: string,
    recipientId: number,
  ): Promise<void> {
    const languages = await this.languageRepository.find({ where: { isActive: true } });
    const translations = languages.map(lang => ({
      lang: lang.code,
      title: this.i18n.t('messages.Tasks.statusChanged.title' as any, {
        lang: lang.code,
        args: { title: taskTitle, status: newStatus },
      }),
      message: this.i18n.t('messages.Tasks.statusChanged.message' as any, {
        lang: lang.code,
        args: { title: taskTitle, status: newStatus },
      }),
    }));
    await this.eventEmitter.emitToUser(recipientId, 'task.status_changed', {
      taskId,
      translations,
      recipientId,
    });
  }

  public async sendProjectInvitation(projectId: number, projectName: string, recipientId: number): Promise<void> {
    const languages = await this.languageRepository.find({ where: { isActive: true } });
    const translations = languages.map(lang => ({
      lang: lang.code,
      title: this.i18n.t('messages.Projects.invitation.title' as any, { lang: lang.code, args: { projectName } }),
      message: this.i18n.t('messages.Projects.invitation.message' as any, { lang: lang.code, args: { projectName } }),
    }));
    await this.eventEmitter.emitToUser(recipientId, 'project.invitation', {
      projectId,
      projectName,
      translations,
      recipientId,
    });
  }

  public async sendCommentAdded(taskId: number, taskTitle: string, recipientId: number): Promise<void> {
    const languages = await this.languageRepository.find({ where: { isActive: true } });
    const translations = languages.map(lang => ({
      lang: lang.code,
      title: this.i18n.t('messages.Tasks.commentAdded.title' as any, { lang: lang.code, args: { title: taskTitle } }),
      message: this.i18n.t('messages.Tasks.commentAdded.message' as any, {
        lang: lang.code,
        args: { title: taskTitle },
      }),
    }));
    await this.eventEmitter.emitToUser(recipientId, 'task.comment_added', {
      taskId,
      translations,
      recipientId,
    });
  }
}
