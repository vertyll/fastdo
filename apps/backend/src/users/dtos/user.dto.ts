import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'User ID' })
  public readonly id: number;

  @ApiProperty({ description: 'User name (email)' })
  public readonly name: string;
}
