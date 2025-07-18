import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;
}
