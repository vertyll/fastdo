import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from 'src/core/language/entities/language.entity';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { EventEmitterService } from './services/event-emitter.service';
import { NotificationWebSocketService } from './services/notification-websocket.service';
import { SocketConnectionService } from './services/socket-connection.service';
import { IEventEmitterServiceToken } from './tokens/event-emitter-service.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([Language]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.security.jwt.accessToken.secret'),
        signOptions: { expiresIn: configService.get<string>('app.security.jwt.accessToken.expiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    NotificationsGateway,
    SocketConnectionService,
    EventEmitterService,
    NotificationWebSocketService,
    {
      provide: IEventEmitterServiceToken,
      useClass: EventEmitterService,
    },
  ],
  exports: [
    IEventEmitterServiceToken,
    SocketConnectionService,
    NotificationsGateway,
    NotificationWebSocketService,
  ],
})
export class EventsModule {
  constructor(
    private readonly eventEmitterService: EventEmitterService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    // Set gateway reference in event emitter to avoid circular dependency
    this.eventEmitterService.setGateway(this.notificationsGateway);
  }
}
