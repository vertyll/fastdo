import { ApiProperty } from '@nestjs/swagger';

export class ProjectTypeDto {
  @ApiProperty({ description: 'Project type ID' })
  public readonly id: number;

  @ApiProperty({ description: 'Project type name (translated)' })
  public readonly name: string;

  @ApiProperty({ description: 'Project type description (translated)', required: false })
  public readonly description?: string;
}
