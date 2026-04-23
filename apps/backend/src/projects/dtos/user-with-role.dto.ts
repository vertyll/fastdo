import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber } from 'class-validator';

export class UserWithRoleDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  public readonly email: string;

  @ApiProperty({ description: 'Project role ID', example: 1 })
  @IsNumber()
  public readonly role: number;
}
