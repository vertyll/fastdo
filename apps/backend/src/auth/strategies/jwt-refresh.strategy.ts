import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { I18nService } from 'nestjs-i18n';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthStrategyEnum } from '../../common/enums/auth-strategy.enum';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { User } from '../../users/entities/user.entity';
import { UsersFacadeService } from '../../users/facades/users-facade.service';
import { JwtRefreshPayload } from '../interfaces/jwt-refresh-payload.interface';
import { IJwtRefreshStrategy } from '../interfaces/jwt-refresh-strategy.interface';
import { RefreshTokenService } from '../refresh-token.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, AuthStrategyEnum.JwtRefresh)
  implements IJwtRefreshStrategy
{
  constructor(
    private readonly usersService: UsersFacadeService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly refreshTokenService: RefreshTokenService,
    configService: ConfigService,
  ) {
    const refreshTokenSecret = configService.get<string>('app.security.jwt.refreshToken.secret');
    if (!refreshTokenSecret) throw new Error('JWT_REFRESH_SECRET is not defined');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        request => request?.cookies?.refresh_token,
      ]),
      ignoreExpiration: false,
      secretOrKey: refreshTokenSecret,
      passReqToCallback: true,
    });
  }

  async validate(request: FastifyRequest, payload: JwtRefreshPayload): Promise<User> {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.invalidToken'));

    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.isActive || !user.isEmailConfirmed) {
      throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.invalidToken'));
    }

    await this.refreshTokenService.validateRefreshToken(user.id, refreshToken);

    return user;
  }
}
