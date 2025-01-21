import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailConfigService } from '../../config/mail.config';
import { MailSendFailedException } from '../../exceptions/mail-send-failed.exception';
import { IMailTransport } from '../../interfaces/mail-transport.interface';

@Injectable()
export class DevTransport implements IMailTransport {
  private transporter: nodemailer.Transporter;
  private isMailDevAvailable: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailConfig: MailConfigService,
    @Inject('MailLogger') private readonly logger: Logger,
  ) {
    this.initializeTransporter().catch(error => {
      this.logger.error(
        `Failed to initialize MailDev transporter: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    });
  }

  private async initializeTransporter() {
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

  async sendMail(options: { from: string; to: string; subject: string; html: string; }): Promise<void> {
    if (!this.isMailDevAvailable) {
      this.logger.warn(`Would send email in production: ${JSON.stringify(options)}`);
      const environment = this.configService.get<string>('app.environment');
      if (environment === 'development') {
        return;
      }
      throw new MailSendFailedException('Mail service is not available');
    }

    try {
      await this.transporter.sendMail(options);
    } catch (error) {
      throw new MailSendFailedException(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
