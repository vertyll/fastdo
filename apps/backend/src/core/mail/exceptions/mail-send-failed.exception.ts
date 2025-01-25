import { InternalServerErrorException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n/i18n.generated';

export class MailSendFailedException extends InternalServerErrorException {
  constructor(
    readonly i18n: I18nService<I18nTranslations>,
    message: string,
  ) {
    super(
      i18n.translate('messages.Mail.errors.failedToSendEmail', { args: { message } }),
    );
  }
}
