import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from 'src/core/language/entities/language.entity';
import { MailModule } from '../core/mail/mail.module';
import { EventsModule } from '../events/events.module';
import { User } from '../users/entities/user.entity';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationSettings } from './entities/notification-settings.entity';
import { NotificationTranslation } from './entities/notification-translation.entity';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './services/notifications.service';
import { INotificationsServiceToken } from './tokens/notifications-service.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationSettings, NotificationTranslation, Language, User]),
    MailModule,
    EventsModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: INotificationsServiceToken,
      useClass: NotificationsService,
    },
  ],
  exports: [INotificationsServiceToken],
})
export class NotificationModule {}
