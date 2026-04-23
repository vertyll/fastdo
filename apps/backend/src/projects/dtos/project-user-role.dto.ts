import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AssignProjectRoleDto {
  @ApiProperty({ description: 'The project ID' })
  @IsNumber()
  public readonly projectId: number;

  @ApiProperty({ description: 'The user ID' })
  @IsNumber()
  public readonly userId: number;

  @ApiProperty({ description: 'The project role ID', example: 1 })
  @IsNumber()
  public readonly role: number;
}

export class UpdateProjectRoleDto {
  @ApiProperty({ description: 'The new project role ID', example: 1 })
  @IsNumber()
  public readonly role: number;
}
