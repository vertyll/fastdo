import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n/i18n.generated';
import { MailConfig } from '../../config/types/app.config.type';
import { IMailConfig } from '../interfaces/mail-config.interface';

@Injectable()
export class MailConfigService {
  constructor(
    private configService: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public getConfig(): IMailConfig {
    const mailConfig: MailConfig = this.configService.getOrThrow<MailConfig>('app.mail');

    if (!mailConfig.host || !mailConfig.port || !mailConfig.from) {
      throw new Error(
        this.i18n.t('messages.Mail.errors.missingMailConfiguration'),
      );
    }

    return {
      host: mailConfig.host,
      port: mailConfig.port,
      user: mailConfig.user,
      password: mailConfig.password,
      from: mailConfig.from,
    };
  }

  public getDevConfig(): IMailConfig {
    const mailConfig: MailConfig = this.configService.getOrThrow<MailConfig>('app.mail');

    if (!mailConfig.from) throw new Error(this.i18n.t('messages.Mail.errors.missingMailConfiguration'));

    return {
      host: mailConfig.dev.host,
      port: mailConfig.dev.port,
      from: mailConfig.from,
    };
  }
}
