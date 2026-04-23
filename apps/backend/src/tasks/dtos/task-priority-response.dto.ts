import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from '../../common/dtos/translation.dto';

export class TaskPriorityResponseDto {
  @ApiProperty({ description: 'Priority ID', example: 1 })
  public readonly id: number;

  @ApiProperty({ description: 'Priority code', example: 'medium' })
  public readonly code: string;

  @ApiProperty({
    description: 'List of translations',
    type: [TranslationDto],
  })
  public readonly translations: TranslationDto[];
}
