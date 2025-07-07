import { ApiProperty } from '@nestjs/swagger';

export class ProjectCategoryDto {
  @ApiProperty({ description: 'Category ID' })
  id: number;

  @ApiProperty({ description: 'Category name (translated)' })
  name: string;
}
