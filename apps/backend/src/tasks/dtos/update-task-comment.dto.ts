import { MultipartFile } from '@fastify/multipart';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsFile } from '../../common/decorators/is-file.decorator';
import { MultipartArray } from '../../common/decorators/multipart-transform.decorator';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

export class UpdateTaskCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  @MinLength(1, {
    message: i18nValidationMessage<I18nTranslations>('messages.Validation.minLength', { length: 1 }),
  })
  content: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
    description: 'Comment attachment files',
  })
  @IsOptional()
  @MultipartArray()
  @IsFile({
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
    maxSize: 5 * 1024 * 1024,
  })
  attachments?: MultipartFile[];
}
