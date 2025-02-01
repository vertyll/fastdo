import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token' })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('messages.Validation.isString') })
  token: string;

  @ApiProperty({ description: 'New password' })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('messages.Validation.isString') })
  @MinLength(8, {
    message: i18nValidationMessage<I18nTranslations>('messages.Validation.minLength', { length: 8 }),
  })
  @Matches(/[A-Z]/, {
    message: i18nValidationMessage<I18nTranslations>('messages.Validation.uppercaseLetter'),
  })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: i18nValidationMessage<I18nTranslations>('messages.Validation.specialCharacter'),
  })
  password: string;
}
