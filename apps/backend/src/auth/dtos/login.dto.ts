import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail address',
  })
  @IsEmail()
  public readonly email: string;

  @ApiProperty({
    description: 'User password',
  })
  @IsString()
  public readonly password: string;
}
