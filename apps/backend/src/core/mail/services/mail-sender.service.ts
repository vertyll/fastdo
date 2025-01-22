import { Inject, Injectable, Logger } from '@nestjs/common';
import { MailConfigService } from '../config/mail.config';
import { MailSendFailedException } from '../exceptions/mail-send-failed.exception';
import { IMailTemplate } from '../interfaces/mail-template.interface';
import { IMailTransport } from '../interfaces/mail-transport.interface';

@Injectable()
export class MailSenderService {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(
    @Inject('IMailTransport') private readonly transport: IMailTransport,
    @Inject('IMailTemplate') private readonly templateService: IMailTemplate,
    private readonly mailConfig: MailConfigService,
    @Inject('MailLogger') private readonly logger: Logger,
  ) {}

  async sendMail(options: {
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
        currentError = error instanceof Error ? error : new Error('Unknown error occurred');
        this.logger.warn(
          `Failed to send email (attempt ${attempt}/${this.maxRetries}): ${currentError.message}`,
        );

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    this.logger.warn(
      `Failed to send email after ${this.maxRetries} attempts`,
    );
    throw new MailSendFailedException(currentError?.message || 'Failed to send email');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
