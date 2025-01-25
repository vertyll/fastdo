import { HttpException, HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n/i18n.generated';

export class FileUploadException extends HttpException {
  constructor(
    readonly i18n: I18nService<I18nTranslations>,
    message: string,
    cause?: Error,
  ) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `${i18n.translate('messages.File.errors.fileNotUploaded')}: ${message}`,
        error: i18n.translate('messages.File.errors.fileNotUploaded'),
        cause: cause?.message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
