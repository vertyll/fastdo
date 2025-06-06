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
import { ConfirmationTokenFacadeService } from './facades/confirmation-token-facade.service';
import { RefreshTokenFacadeService } from './facades/refresh-token-facade.service';
import { RefreshTokenService } from './refresh-token.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

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
    ConfirmationTokenService,
    ConfirmationTokenFacadeService,
    RefreshTokenService,
    RefreshTokenFacadeService,
    CookieConfigService,
    DurationConfigProvider,
  ],
  controllers: [AuthController],
  exports: [ConfirmationTokenFacadeService, RefreshTokenFacadeService],
})
export class AuthModule {}
