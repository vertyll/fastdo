import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailConfigService } from './config/mail.config';
import { MailSenderService } from './services/mail-sender.service';
import { MailTemplateService } from './services/mail-template.service';
import { MailService } from './services/mail.service';
import { DevTransport } from './services/transports/dev-transport.service';
import { NodemailerTransport } from './services/transports/nodemailer-transport.service';

@Module({
  imports: [ConfigModule],
  providers: [
    MailConfigService,
    MailTemplateService,
    {
      provide: 'IMailTransport',
      useClass: process.env.NODE_ENV === 'development'
        ? DevTransport
        : NodemailerTransport,
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
