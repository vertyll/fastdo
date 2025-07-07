import { ApiProperty } from '@nestjs/swagger';

export class PriorityDto {
  @ApiProperty({ description: 'Priority ID' })
  id: number;

  @ApiProperty({ description: 'Priority name (translated)' })
  name: string;
}
