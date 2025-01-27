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

@Module({
  providers: [
    MailConfigService,
    MailTemplateService,
    {
      provide: 'IMailTransport',
      useFactory: (
        configService: ConfigService,
        mailConfigService: MailConfigService,
        i18n: I18nService<I18nTranslations>,
      ) => {
        const environment = configService.get<string>('app.environment');
        const mailLogger = new Logger('MailService');

        return environment === Environment.DEVELOPMENT
          ? new DevTransport(configService, mailConfigService, mailLogger, i18n)
          : new NodemailerTransport(mailConfigService);
      },
      inject: [ConfigService, MailConfigService, I18nService],
    },
    {
      provide: 'IMailTemplate',
      useClass: MailTemplateService,
    },
    {
      provide: 'MailLogger',
      useValue: new Logger('MailService'),
    },
    MailSenderService,
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
