import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import {IJwtStrategy} from "../interfaces/jwt-strategy.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) implements IJwtStrategy {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService<I18nTranslations>,
    configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('app.security.jwt.secret');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any): Promise<User & { roles: string[]; }> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.isActive || !user.isEmailConfirmed) {
      throw new UnauthorizedException(
        this.i18n.t('messages.Auth.errors.invalidToken'),
      );
    }

    return { ...user, roles: payload.roles };
  }
}
