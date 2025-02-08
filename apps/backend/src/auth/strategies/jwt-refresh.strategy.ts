import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { FastifyRequest } from 'fastify';
import { I18nService } from 'nestjs-i18n';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { AuthStrategyEnum } from '../../common/enums/auth-strategy.enum';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { JwtRefreshPayload } from '../interfaces/jwt-refresh-payload.interface';
import { IJwtRefreshStrategy } from '../interfaces/jwt-refresh-strategy.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, AuthStrategyEnum.JwtRefresh)
  implements IJwtRefreshStrategy
{
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService<I18nTranslations>,
    configService: ConfigService,
    @InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>,
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

    const storedTokens = await this.refreshTokenRepository.find({
      where: { user: { id: user.id } },
    });
    if (storedTokens.length === 0) throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.invalidToken'));

    let validToken: RefreshToken | undefined;
    for (const token of storedTokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.token);
      if (isMatch) {
        validToken = token;
        break;
      }
    }
    if (!validToken) throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.invalidToken'));

    if (validToken.expiresAt < new Date()) {
      throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.tokenExpired'));
    }

    return user;
  }
}
