import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ClsModule } from 'nestjs-cls';
import appConfig from '../core/config/app.config';
import { ApiKeyGuard } from './guards/api-key.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { LoggingMiddleware } from './middlewares/logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      guard: { mount: false },
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [{
          ttl: configService.getOrThrow<number>('app.security.rateLimiting.windowMs'),
          limit: configService.getOrThrow<number>('app.security.rateLimiting.max'),
        }],
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class CommonModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
