import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtMiddleware } from '../common/middlewares/jwt.middleware';
import { MailModule } from '../core/mail/mail.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfirmationTokenService } from './confirmation-token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    RolesModule,
    MailModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.security.jwt.secret'),
        signOptions: { expiresIn: configService.get<string>('app.security.jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, ConfirmationTokenService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
