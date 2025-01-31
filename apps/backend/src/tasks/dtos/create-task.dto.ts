import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @MinLength(3, {
    message: i18nValidationMessage<I18nTranslations>('messages.Validation.minLength', { length: 3 }),
  })
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDone?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  projectId?: number;
}
