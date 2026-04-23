import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailResponseDto {
  @ApiProperty()
  public readonly success: boolean;

  @ApiProperty()
  public readonly email: string;
}
