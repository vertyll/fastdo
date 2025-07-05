import { ApiProperty } from '@nestjs/swagger';

export class SimpleUserDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'User name (first name + last name)' })
  name: string;
}
