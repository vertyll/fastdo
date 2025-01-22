import { Injectable } from '@nestjs/common';
import { MailConfigService } from '../config/mail.config';
import { MailSenderService } from './mail-sender.service';

@Injectable()
export class MailService {
  constructor(
    private readonly mailSender: MailSenderService,
    private readonly mailConfig: MailConfigService,
  ) {}

  async sendConfirmationEmail(to: string, token: string): Promise<void> {
    const config = this.mailConfig.getConfig();
    await this.mailSender.sendMail({
      to,
      subject: 'Confirm your email',
      templateName: 'confirmation',
      templateData: {
        confirmationUrl: `${config.appUrl}/auth/confirm-email?token=${token}`,
      },
    });
  }
}
