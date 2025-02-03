import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';
import { Strategy } from 'passport-local';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { User } from '../../users/entities/user.entity';
import { AuthService } from '../auth.service';
import { ILocalStrategy } from '../interfaces/local-strategy.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) implements ILocalStrategy {
  constructor(
    private readonly authService: AuthService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.invalidCredentials'));

    return user;
  }
}
