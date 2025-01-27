import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import appConfig from '../core/config/app.config';
import { ApiKeyGuard } from './guards/api-key.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { LoggingMiddleware } from './middlewares/logging.middleware';

@Module({
  imports: [ConfigModule.forRoot({
    load: [appConfig],
    isGlobal: true,
  })],
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
  ],
})
export class CommonModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
