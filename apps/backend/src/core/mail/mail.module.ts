import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { Environment } from '../config/types/app.config.type';
import { MailConfigService } from './config/mail.config';
import { MailSenderService } from './services/mail-sender.service';
import { MailTemplateService } from './services/mail-template.service';
import { MailService } from './services/mail.service';
import { DevTransport } from './services/transports/dev-transport.service';
import { NodemailerTransport } from './services/transports/nodemailer-transport.service';
import { MailLoggerToken } from './tokens/mail-logger.token';
import { IMailServiceToken } from './tokens/mail-service.token';
import { IMailTemplateToken } from './tokens/mail-template.token';
import { IMailTransportToken } from './tokens/mail-transport.token';

@Module({
  providers: [
    MailConfigService,
    MailTemplateService,
    {
      provide: IMailTransportToken,
      useFactory: (
        configService: ConfigService,
        mailConfigService: MailConfigService,
        i18n: I18nService<I18nTranslations>,
      ): DevTransport | NodemailerTransport => {
        const environment = configService.get<string>('app.environment');
        const mailLogger = new Logger('MailService');

        return environment === Environment.DEVELOPMENT
          ? new DevTransport(configService, mailConfigService, mailLogger, i18n)
          : new NodemailerTransport(mailConfigService);
      },
      inject: [ConfigService, MailConfigService, I18nService],
    },
    {
      provide: IMailTemplateToken,
      useClass: MailTemplateService,
    },
    {
      provide: MailLoggerToken,
      useValue: new Logger('MailService'),
    },
    {
      provide: IMailServiceToken,
      useClass: MailService,
    },
    MailSenderService,
  ],
  exports: [
    IMailServiceToken,
  ],
})
export class MailModule {
}
