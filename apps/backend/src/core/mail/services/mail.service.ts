import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n/i18n.generated';
import { MailTemplateName } from '../enums/mail-template-name.enum';
import { IMailService } from '../interfaces/mail-service.interface';
import { MailSenderService } from './mail-sender.service';

@Injectable()
export class MailService implements IMailService {
  constructor(
    private readonly mailSender: MailSenderService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public async sendConfirmationEmail(to: string, token: string): Promise<void> {
    const appUrl = `${this.configService.get<string>('app.appUrl')}/api`;
    await this.mailSender.sendMail({
      to,
      subject: this.i18n.t('messages.Mail.confirmationEmail.subject'),
      templateName: MailTemplateName.Confirmation,
      templateData: {
        confirmationUrl: `${appUrl}/auth/confirm-email?token=${token}`,
      },
    });
  }

  public async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('app.frontend.url');
    await this.mailSender.sendMail({
      to,
      subject: this.i18n.t('messages.Mail.resetPasswordEmail.subject'),
      templateName: MailTemplateName.ResetPassword,
      templateData: {
        resetUrl: `${frontendUrl}/reset-password?token=${token}`,
      },
    });
  }

  public async sendEmailChangeConfirmation(to: string, token: string): Promise<void> {
    const appUrl = `${this.configService.get<string>('app.appUrl')}/api`;
    await this.mailSender.sendMail({
      to,
      subject: this.i18n.t('messages.Mail.emailChangeEmail.subject'),
      templateName: MailTemplateName.EmailChange,
      templateData: {
        confirmationUrl: `${appUrl}/auth/confirm-email-change?token=${token}`,
      },
    });
  }

  public async sendNotificationEmail(to: string, subject: string, content: string): Promise<void> {
    await this.mailSender.sendMail({
      to,
      subject,
      templateName: MailTemplateName.Notification,
      templateData: {
        content,
      },
    });
  }
}
