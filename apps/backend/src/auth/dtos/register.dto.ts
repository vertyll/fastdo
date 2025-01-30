import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsBoolean, IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

export class RegisterDto {
  @ApiProperty({ description: 'E-mail address' })
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('messages.Validation.isEmail') })
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('messages.Validation.isString') })
  @MinLength(8, {
    message: i18nValidationMessage<I18nTranslations>('messages.Validation.minLength', {
      args: { length: 8 },
    }),
  })
  @Matches(/[A-Z]/, {
    message: i18nValidationMessage<I18nTranslations>('messages.Validation.uppercaseLetter'),
  })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: i18nValidationMessage<I18nTranslations>('messages.Validation.specialCharacter'),
  })
  password: string;

  @ApiProperty({ description: 'Terms acceptance' })
  @IsBoolean()
  @Equals(true, { message: i18nValidationMessage<I18nTranslations>('messages.Validation.termsRequired') })
  termsAccepted: boolean;

  @ApiProperty({ description: 'Privacy policy acceptance' })
  @IsBoolean()
  @Equals(true, { message: i18nValidationMessage<I18nTranslations>('messages.Validation.privacyPolicyRequired') })
  privacyPolicyAccepted: boolean;
}
