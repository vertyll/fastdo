import { ApiProperty } from '@nestjs/swagger';

export class ProjectStatusDto {
  @ApiProperty({ description: 'Status ID' })
  id: number;

  @ApiProperty({ description: 'Status name (translated)' })
  name: string;
}
