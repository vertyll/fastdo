import { ApiProperty } from '@nestjs/swagger';

export class ProjectRoleDto {
  @ApiProperty({
    description: 'The unique identifier of the project role',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The translated name of the project role',
    example: 'Manager',
  })
  name: string;

  @ApiProperty({
    description: 'The translated description of the project role',
    example: 'Manages the project and oversees all activities',
    required: false,
  })
  description?: string;
}
