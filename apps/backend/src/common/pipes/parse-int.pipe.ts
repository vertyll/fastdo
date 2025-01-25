import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

@Injectable()
export class ParseIntPipe implements PipeTransform<string | number, number> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public transform(value: string | number, _metadata: ArgumentMetadata): number {
    const i18n = I18nContext.current<I18nTranslations>();
    if (!i18n) {
      throw new BadRequestException('Translation context is not available');
    }
    if (typeof value === 'number') {
      if (!Number.isInteger(value)) {
        throw new BadRequestException(
          i18n.translate('messages.Validation.isInteger'),
        );
      }
      return value;
    }

    const val = Number(value);
    if (isNaN(val) || !Number.isInteger(val)) {
      throw new BadRequestException(
        i18n.translate('messages.Validation.isInteger'),
      );
    }
    return val;
  }
}
