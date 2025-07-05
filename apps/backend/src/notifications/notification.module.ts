import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../core/mail/mail.module';
import { EventsModule } from '../events/events.module';
import { User } from '../users/entities/user.entity';
import { NotificationController } from './controllers/notification.controller';
import { NotificationSettings } from './entities/notification-settings.entity';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './services/notification.service';
import { INotificationServiceToken } from './tokens/notification-service.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationSettings, User]),
    MailModule,
    EventsModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: INotificationServiceToken,
      useClass: NotificationService,
    },
  ],
  exports: [INotificationServiceToken],
})
export class NotificationModule {}
