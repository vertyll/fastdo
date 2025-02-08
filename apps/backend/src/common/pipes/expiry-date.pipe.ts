import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { DurationPipe } from './duration.pipe';

@Injectable()
export class ExpiryDatePipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): Date | null {
    const i18n = I18nContext.current<I18nTranslations>();
    if (!i18n) throw new Error('I18nContext not available');

    if (!value) return null;

    const milliseconds = new DurationPipe().transform(value, metadata);
    if (milliseconds === null || milliseconds <= 0) {
      throw new BadRequestException(i18n.translate('messages.Validation.isDuration'));
    }

    return new Date(Date.now() + milliseconds);
  }
}
