import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

export class CreateTaskCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  @MinLength(1, {
    message: i18nValidationMessage<I18nTranslations>('messages.Validation.minLength', { length: 1 }),
  })
  content: string;

  @ApiProperty({ required: false, description: 'Attachment file IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentIds?: string[];
}
