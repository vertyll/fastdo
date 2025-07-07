import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString } from 'class-validator';

export class UserWithRoleDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ description: 'Project role ID', example: 1 })
  @IsNumber()
  role: number;
}
