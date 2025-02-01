import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'E-mail address' })
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('messages.Validation.isEmail') })
  email: string;
}
