import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty()
  public readonly id: number;

  @ApiProperty()
  public readonly code: string;

  @ApiProperty()
  public readonly name: string;

  @ApiProperty({ required: false, nullable: true })
  public readonly description: string | null;
}
