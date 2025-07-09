import { ApiProperty } from '@nestjs/swagger';

class TaskPriorityTranslationDto {
  @ApiProperty({ description: 'Language code', example: 'en' })
  lang: string;

  @ApiProperty({ description: 'Name of the priority', example: 'High' })
  name: string;

  @ApiProperty({ description: 'Optional description of the priority', example: 'High priority', required: false })
  description?: string;
}

export class TaskPriorityResponseDto {
  @ApiProperty({ description: 'Priority ID', example: 1 })
  id: number;

  @ApiProperty({
    description: 'List of translations',
    type: [TaskPriorityTranslationDto],
  })
  translations: TaskPriorityTranslationDto[];
}
