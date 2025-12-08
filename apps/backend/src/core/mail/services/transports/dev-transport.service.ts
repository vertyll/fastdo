import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import * as nodemailer from 'nodemailer';
import { I18nTranslations } from '../../../../generated/i18n/i18n.generated';
import { EnvironmentEnum } from '../../../config/types/app.config.type';
import { MailConfigService } from '../../config/mail.config';
import { MailSendFailedException } from '../../exceptions/mail-send-failed.exception';
import { IMailTransport } from '../../interfaces/mail-transport.interface';
import { MailLoggerToken } from '../../tokens/mail-logger.token';

@Injectable()
export class DevTransport implements IMailTransport {
  private transporter: nodemailer.Transporter;
  private isMailDevAvailable: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailConfig: MailConfigService,
    @Inject(MailLoggerToken) private readonly logger: Logger,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {
    this.initializeTransporter().catch(error => {
      this.logger.error(
        `Failed to initialize MailDev transporter: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    });
  }

  public async sendMail(options: { from: string; to: string; subject: string; html: string }): Promise<void> {
    if (!this.isMailDevAvailable) {
      this.logger.warn(`Would send email in production: ${JSON.stringify(options)}`);
      const environment = this.configService.get<string>('app.environment');
      if (environment === EnvironmentEnum.DEVELOPMENT) return;

      throw new MailSendFailedException(this.i18n, this.i18n.t('messages.Mail.errors.mailDevNotAvailable'));
    }

    try {
      await this.transporter.sendMail(options);
    } catch (error) {
      throw new MailSendFailedException(
        this.i18n,
        error instanceof Error ? error.message : this.i18n.t('messages.Errors.unknownError'),
      );
    }
  }

  private async initializeTransporter(): Promise<void> {
    const config = this.mailConfig.getDevConfig();
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      ignoreTLS: true,
    });

    try {
      await this.transporter.verify();
      this.isMailDevAvailable = true;
      this.logger.log('MailDev is available');
    } catch {
      this.isMailDevAvailable = false;
      this.logger.warn('MailDev is not available. Emails will not be sent in development mode.');
    }
  }
}
