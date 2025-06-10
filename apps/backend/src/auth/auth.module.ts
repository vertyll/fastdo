import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CookieConfigService } from '../core/config/cookie.config';
import { MailModule } from '../core/mail/mail.module';
import { DurationConfigProvider } from '../core/providers/duration-config.provider';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfirmationTokenService } from './confirmation-token.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { IConfirmationTokenServiceToken } from './tokens/confirmation-token-service.token';
import { IRefreshTokenServiceToken } from './tokens/refresh-token-service.token';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    RolesModule,
    MailModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.security.jwt.accessToken.secret'),
        signOptions: { expiresIn: configService.get<string>('app.security.jwt.accessToken.expiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    CookieConfigService,
    DurationConfigProvider,
    {
      provide: IConfirmationTokenServiceToken,
      useClass: ConfirmationTokenService,
    },
    {
      provide: IRefreshTokenServiceToken,
      useClass: RefreshTokenService,
    },
  ],
  controllers: [AuthController],
  exports: [
    IConfirmationTokenServiceToken,
    IRefreshTokenServiceToken,
  ],
})
export class AuthModule {}
