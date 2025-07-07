import { ApiProperty } from '@nestjs/swagger';

export class ProjectTypeDto {
  @ApiProperty({ description: 'Project type ID' })
  id: number;

  @ApiProperty({ description: 'Project type name (translated)' })
  name: string;

  @ApiProperty({ description: 'Project type description (translated)', required: false })
  description?: string;
}
