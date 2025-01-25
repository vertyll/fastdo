import { BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n/i18n.generated';

export class FileValidationException extends BadRequestException {
  constructor(
    readonly i18n: I18nService<I18nTranslations>,
    message: string,
  ) {
    super({
      statusCode: 400,
      message,
      error: i18n.translate('messages.File.errors.fileValidation'),
    });
  }
}
