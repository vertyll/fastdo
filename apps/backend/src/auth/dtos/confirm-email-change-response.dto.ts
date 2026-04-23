import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailChangeResponseDto {
  @ApiProperty()
  public readonly success: boolean;

  @ApiProperty()
  public readonly email: string;
}
