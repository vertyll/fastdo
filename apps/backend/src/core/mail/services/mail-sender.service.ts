import { Inject, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n/i18n.generated';
import { MailConfigService } from '../config/mail.config';
import { MailSendFailedException } from '../exceptions/mail-send-failed.exception';
import { IMailTemplate } from '../interfaces/mail-template.interface';
import { IMailTransport } from '../interfaces/mail-transport.interface';
import { MailLoggerToken } from '../tokens/mail-logger.token';
import { IMailTemplateToken } from '../tokens/mail-template.token';
import { IMailTransportToken } from '../tokens/mail-transport.token';

@Injectable()
export class MailSenderService {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(
    @Inject(IMailTransportToken) private readonly transport: IMailTransport,
    @Inject(IMailTemplateToken) private readonly templateService: IMailTemplate,
    private readonly mailConfig: MailConfigService,
    @Inject(MailLoggerToken) private readonly logger: Logger,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public async sendMail(options: {
    to: string;
    subject: string;
    templateName: string;
    templateData: any;
  }): Promise<void> {
    let currentError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const config = this.mailConfig.getConfig();
        const html = await this.templateService.getTemplate(
          options.templateName,
          options.templateData,
        );

        await this.transport.sendMail({
          from: config.from,
          to: options.to,
          subject: options.subject,
          html,
        });

        return;
      } catch (error) {
        currentError = error instanceof Error ? error : new Error(this.i18n.t('messages.Errors.unknownError'));
        this.logger.warn(
          `Failed to send email (attempt ${attempt}/${this.maxRetries}): ${currentError.message}`,
        );

        if (attempt < this.maxRetries) await this.delay(this.retryDelay * attempt);
      }
    }

    this.logger.warn(
      `Failed to send email after ${this.maxRetries} attempts`,
    );
    throw new MailSendFailedException(
      this.i18n,
      currentError?.message || this.i18n.t('messages.Mail.errors.failedToSendEmail'),
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
