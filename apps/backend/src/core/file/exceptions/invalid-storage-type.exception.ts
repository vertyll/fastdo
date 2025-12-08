import { BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n/i18n.generated';
import { StorageTypeEnum } from '../../config/types/app.config.type';

export class InvalidStorageTypeException extends BadRequestException {
  constructor(
    readonly i18n: I18nService<I18nTranslations>,
    type: StorageTypeEnum | string,
  ) {
    super({
      statusCode: 400,
      message: i18n.translate('messages.File.errors.invalidStorageType', { args: { type } }),
      error: i18n.translate('messages.File.errors.invalidStorageType'),
    });
  }
}
