import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailSenderService } from './mail-sender.service';

@Injectable()
export class MailService {
  constructor(
    private readonly mailSender: MailSenderService,
    private readonly configService: ConfigService,
  ) {}

  async sendConfirmationEmail(to: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>('app.appUrl');
    await this.mailSender.sendMail({
      to,
      subject: 'Confirm your email',
      templateName: 'confirmation',
      templateData: {
        confirmationUrl: `${appUrl}/auth/confirm-email?token=${token}`,
      },
    });
  }
}
