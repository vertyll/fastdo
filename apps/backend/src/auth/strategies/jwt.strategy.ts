import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { User } from '../../users/entities/user.entity';
import { IUsersService } from '../../users/interfaces/users-service.interface';
import { IUsersServiceToken } from '../../users/tokens/users-service.token';
import { IJwtStrategy } from '../interfaces/jwt-strategy.interface';
import { JwtPayload } from '../types/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) implements IJwtStrategy {
  constructor(
    @Inject(IUsersServiceToken) private readonly usersService: IUsersService,
    private readonly i18n: I18nService<I18nTranslations>,
    configService: ConfigService,
  ) {
    const accessTokenSecret = configService.get<string>('app.security.jwt.accessToken.secret');
    if (!accessTokenSecret) throw new Error('JWT_ACCESS_SECRET is not defined');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessTokenSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<User & { roles: string[]; }> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.isActive || !user.isEmailConfirmed) {
      throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.invalidToken'));
    }
    return { ...user, roles: payload.roles };
  }
}
