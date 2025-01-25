import { NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n/i18n.generated';

export class FileNotFoundException extends NotFoundException {
  constructor(
    readonly i18n: I18nService<I18nTranslations>,
    fileId: string,
  ) {
    super({
      statusCode: 404,
      message: i18n.translate('messages.File.errors.fileNotFound', { args: { fileId } }),
      error: i18n.translate('messages.File.errors.fileNotFound'),
    });
  }
}
