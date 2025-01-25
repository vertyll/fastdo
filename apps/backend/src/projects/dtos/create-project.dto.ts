import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

export class CreateProjectDto {
  @ApiProperty({ description: 'The name of the project' })
  @IsString()
  @MinLength(3, {
    message: i18nValidationMessage<I18nTranslations>('messages.Validation.minLength', {
      args: { length: 3 },
    }),
  })
  name: string;
}
