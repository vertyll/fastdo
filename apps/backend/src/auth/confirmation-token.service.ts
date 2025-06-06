import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../generated/i18n/i18n.generated';

@Injectable()
export class ConfirmationTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public generateToken(email: string): string {
    return this.jwtService.sign(
      { email },
      {
        expiresIn: this.configService.get<string>('app.security.jwt.confirmationToken.expiresIn'),
        secret: this.configService.get<string>('app.security.jwt.confirmationToken.secret'),
      },
    );
  }

  public verifyToken(token: string): { email: string; } {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('app.security.jwt.confirmationToken.secret'),
      });
    } catch {
      throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.invalidToken'));
    }
  }
}
