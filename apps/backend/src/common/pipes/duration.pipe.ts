import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

@Injectable()
export class DurationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, _metadata: ArgumentMetadata): number | null {
    const i18n = I18nContext.current<I18nTranslations>();
    if (!i18n) throw new Error('I18nContext not available');

    if (!value) return null;

    const match = value.match(/^(\d+)([smhdw])$/);
    if (!match) throw new BadRequestException(i18n.translate('messages.Validation.isDuration'));

    const [, amount, unit] = match;
    const numValue: number = parseInt(amount, 10);

    if (numValue <= 0) {
      throw new BadRequestException(i18n.translate('messages.Validation.mustBePositive'));
    }

    const multipliers: Record<string, number> = {
      's': 1000,
      'm': 1000 * 60,
      'h': 1000 * 60 * 60,
      'd': 1000 * 60 * 60 * 24,
      'w': 1000 * 60 * 60 * 24 * 7,
    };

    return numValue * multipliers[unit];
  }
}
