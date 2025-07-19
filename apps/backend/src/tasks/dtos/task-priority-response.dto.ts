import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from '../../common/dtos/translation.dto';

export class TaskPriorityResponseDto {
  @ApiProperty({ description: 'Priority ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Priority code', example: 'medium' })
  code: string;

  @ApiProperty({
    description: 'List of translations',
    type: [TranslationDto],
  })
  translations: TranslationDto[];
}
